import { useEffect, useMemo, useState } from "react";
import * as RNIap from "react-native-iap";

const PRODUCT_IDS = ["tip_099"];

export function useTipJar({ mock = false } = {}) {
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState([]);
  const [busy, setBusy] = useState(false);
  const useMock = mock;
  useEffect(() => {
    let mounted = true;

    // MOCK PATH: no native calls — just fake data so UI renders
    if (useMock) {
      setProducts([{ productId: "tip_099", localizedPrice: "$0.99" }]);
      setReady(true);
      return () => {};
    }

    (async () => {
      try {
        await RNIap.initConnection();
        const list = await RNIap.getProducts(PRODUCT_IDS); // <-- no TS cast in JS
        if (mounted) {
          setProducts(list ?? []);
          setReady(true);
        }
      } catch (e) {
        console.warn("[IAP] init/getProducts failed", e);
      }
    })();

    // Purchases
    const sub = RNIap.purchaseUpdatedListener(async (purchase) => {
      try {
        // For consumables, finish immediately
        await RNIap.finishTransaction(purchase, true);
      } catch (e) {
        console.warn("[IAP] finishTransaction error", e);
      } finally {
        setBusy(false);
      }
    });

    const errSub = RNIap.purchaseErrorListener((err) => {
      console.warn("[IAP] purchase error", err);
      setBusy(false);
    });

    return () => {
      mounted = false;
      sub.remove();
      errSub.remove();
      RNIap.endConnection();
    };
  }, []);

  const priceById = useMemo(() => {
    const map = {};
    products.forEach((p) => (map[p.productId] = p.localizedPrice ?? ""));
    return map;
  }, [products]);

  async function buy(productId) {
    try {
      setBusy(true);
      // Current RNIap API (works on recent versions):
      await RNIap.requestPurchase({
        sku: productId,
        andDangerouslyFinishTransactionAutomatically: false,
      });
    } catch (e) {
      // Handle user cancel on both old/new codes
      if (
        e?.code === "E_USER_CANCELLED" ||
        e?.code === RNIap.IAPErrorCode?.E_USER_CANCELLED
      ) {
        return setBusy(false);
      }
      console.warn("[IAP] requestPurchase failed", e);
      setBusy(false);
    }
  }

  return { ready, busy, products, priceById, buy };
}
