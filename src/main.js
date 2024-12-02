import { Client, Databases, Users, Messaging } from "node-appwrite";

const PROJECT_ID = process.env.PROJECT_ID;
const DATABASE_ID = process.env.DATABASE_ID;
const COLLECTION_ID_TASKS = process.env.COLLECTION_ID_TASKS;

const GENERAL_UPDATE_ID = process.env.GENERAL_UPDATE_ID;
const TECHNICAL_SUPPORT_ID = process.env.TECHNICAL_SUPPORT_ID;
const PRODUCT_ANNOUNCEMENT_ID = process.env.PRODUCT_ANNOUNCEMENT_ID;

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

      const topicIds = [
        GENERAL_UPDATE_ID, 
        TECHNICAL_SUPPORT_ID, 
        PRODUCT_ANNOUNCEMENT_ID
      ];

      
      let totalUnsubscribed = 0;

      try {
        for (const topicId of topicIds) {
          log(`Topic IDs:${topicId}`);
          try {
            const subscriptions = await messaging.listSubscribers(topicId);
            const userSubscriptions = subscriptions.subscribers.filter(sub => sub.targetId === userId);
         
            log(userSubscriptions)
            for (const subscription of userSubscriptions) {
              await messaging.deleteSubscriber(topicId, subscription.$id);
              totalUnsubscribed++;
            }
          } catch (topicError) {
            error(`Failed to unsubscribe from topic ${topicId}: ${topicError.message}`);
          }
        }

        log(`Unsubscribed user ${userId} from ${totalUnsubscribed} topic subscriptions`);
      } catch (unsubscribeError) {
        error("Error during unsubscription process: " + unsubscribeError.message);
      }

      await users.deleteSessions(userId, sessionId);

      return res.json({ 
        success: true, 
        message: `User logged out and unsubscribed from ${totalUnsubscribed} topics successfully` 
      });
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