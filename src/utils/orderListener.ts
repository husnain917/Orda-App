let lastOrderUnsubscribed = null

export const generateId = () => {
  const id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
  return `${Date.now()}-${id}`
}

export const startOrderListener = (firestore: any, ordaId: string, callback: Function, errorCallback: Function): Function => {
  try {
    const result = lastOrderUnsubscribed && lastOrderUnsubscribed()
    console.log("unsubscribed", result)
  } catch (e) {
    console.log("error unsubscribing")
    /// DO nothing, unsubscribed 
  }
  try {
    lastOrderUnsubscribed = firestore.collection('orders').doc(ordaId).onSnapshot(async (doc) => {
      if (!doc.exists) {
        return
      }
      const data = doc.data()
      await callback(doc, data)
    }, errorCallback)
    return lastOrderUnsubscribed
  } catch (e) {
    console.log(`*** ERROR listening to ordaId ${ordaId}`)
    errorCallback(e)
  }
  return null
}