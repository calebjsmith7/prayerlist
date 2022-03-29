import firestore, { Timestamp } from '@react-native-firebase/firestore';


export default async function MinistryListDatabaseService(collection){
            let minArr = [];
            try{
                let data =
                await firestore()
                .collection(collection)
                .get();
                if(collection == 'maincollection'){
                    for(let i = 0; i < data.docs.length; i++){
                        let localTime = data.docs[i]._data.time.toDate();
                        let localObj = data.docs[i]._data;
                        localObj.time = localTime;
                         minArr.push(localObj);
                     }
                } else {
                    for(let i = 0; i < data.docs.length; i++){
                        minArr.push(data.docs[i]._data);
                    }
                }
                
                console.log('minarr is ' + JSON.stringify(minArr));
               return minArr;
            }
            catch(error) {
                console.log('error is ' + error);
            }
}