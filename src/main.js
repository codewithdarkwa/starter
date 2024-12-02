import { Client, Databases, Users, Messaging } from "node-appwrite";

const PROJECT_ID = process.env.PROJECT_ID
const DATABASE_ID = process.env.DATABASE_ID;
const COLLECTION_ID_TASKS = process.env.COLLECTION_ID_TASKS;


export default async({req, res, log, error}) => {

  const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(PROJECT_ID)
  .setKey(process.env.APPWRITE_SERVER_API_KEY);


  const users = new Users(client);
  const db = new Databases(client);
  const messaging = new Messaging(client);

  if (req.method === 'POST' && req.path === '/logout') {
    try {
      const userId = req.body.userId;
      const sessionId = req.body.sessionId;

      if (!userId || !sessionId) {
        return res.json({ 
          success: false, 
          message: 'User ID and Session ID is required' 
        }, 400);
      }

      // try {
      //   const subscriptions = await messaging.listSubscribers('6745c75f00118025ce9a');
      //   log(subscriptions);
      //   const userSubscriptions = subscriptions.subscribers.filter(
      //     sub => sub.targetId === userId
      //   );

      //   for (const subscription of userSubscriptions) {
      //     await messaging.deleteSubscriber(subscription.$id);
      //   }

      //   log(`Unsubscribed user ${userId} from ${userSubscriptions.length} topics`);
      // } catch (topicError) {
      //   error("Failed to unsubscribe from topics: " + topicError.message);
      // }

      await users.deleteSessions(userId, sessionId);
      return res.json({ success: true, message: 'User logged out successfully' });
    } catch (err) {
      error("Logout failed: " + err.message);
      return res.json({ success: false, message: 'Logout failed' });
    }
  }

  if(req.method == 'GET'){
    const response = await db.listDocuments(DATABASE_ID, COLLECTION_ID_TASKS);
    return res.json(response.documents);
  }



  
}



// // This Appwrite function will be executed every time your function is triggered
// export default async ({ req, res, log, error }) => {
//   // You can use the Appwrite SDK to interact with other services
//   // For this example, we're using the Users service
//   const client = new Client()
//     .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
//     .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
//     .setKey(req.headers['x-appwrite-key'] ?? '');
//   const users = new Users(client);

//   try {
//     const response = await users.list();
//     // Log messages and errors to the Appwrite Console
//     // These logs won't be seen by your end users
//     log(`Total users: ${response.total}`);
//   } catch(err) {
//     error("Could not list users: " + err.message);
//   }

//   // The req object contains the request data
//   if (req.path === "/ping") {
//     // Use res object to respond with text(), json(), or binary()
//     // Don't forget to return a response!
//     return res.text("Pong");
//   }

//   return res.json({
//     motto: "Build like a team of hundreds_",
//     learn: "https://appwrite.io/docs",
//     connect: "https://appwrite.io/discord",
//     getInspired: "https://builtwith.appwrite.io",
//   });
// };
