import firestore, { Timestamp } from '@react-native-firebase/firestore';


export default async function MinistryListDatabaseService(collection, subs){
            let minArr = [];
            let prayerData = [];

    if (collection == 'maincollection') {
    
        try {
            
                firestore()
                .collection(collection)
                .where('ministryId', 'in', subs)
                .get()
                .then((querySnapshot) => {
                    let results = querySnapshot.docs;
                    for(let i = 0; i < results.length; i++){
                        prayerData.push(results[i]._data);
                    }
                    console.log(prayerData);
                    return prayerData;
                })
                /*
                for(let i = 0; i < prayerData.length; i++){
                    let localTime = prayerData[i].time.toDate();
                    let localObj = prayerData[i];
                    localObj.time = localTime;
                     minArr.push(localObj);
                 };
                 console.log('minarr is ' + minArr);*/
                

        } catch (error) {
            console.log(error);
        }
            } else {
                try {
                    let data = await
                        firestore()
                        .collection(collection)
                        .get();

                    for(let i = 0; i < data.docs.length; i++){
                        minArr.push(data.docs[i]._data);
                    }
                    console.log('minArr is ' + minArr);
                    return minArr;
                } catch (error) {
                    console.log(error);
                }
            }       
}