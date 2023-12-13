import { openai } from "../server.js"

export async function buildAssistant(config) {
    let createdAssistant = {};
    try {
        // instructions, name, model
        createdAssistant = await openai.beta.assistants.create({
            instructions: config.instructions,
            name: config.name,
            tools: [],
            model: config.model
        })
        console.log('builtAssistant=>()', { createdAssistant: createdAssistant.id })
    } catch (error) {
        console.log("Error creating assistant: " + error.message)
        return {
            error: 'Error building assistant',
            success: false,
            message: error.message
        }
    }

    return { createdAssistant, config, success: true }
}

// export async function getAllAssistants() {
//     let allAssistants = []
//     try {
//         allAssistants = await openai.beta.assistants.list({
//             order: "desc",
//             limit: 10
//         })
//     } catch (error) {
//         console.log("Error creating assistant: " + error.message)
//     }
//     return allAssistants?.data
// }

// export async function generateUserMessage(message, threadID) {
//     let newMessage = null;
//     try {
//         newMessage = await openai.beta.threads.messages.create(
//             threadID,
//             { role: "user", content: message }
//         )
//     } catch (error) {
//         console.log("Error generating user message: " + error.message)
//     }
//     return newMessage
// }

// export async function startAConversation(userMessage) {
//     let generatedThread = {}
//     try {
//         generatedThread = await openai.beta.threads.create({
//             messages: [
//                 {
//                     role: "user",
//                     content: userMessage
//                 }
//             ]
//         })
//     } catch (error) {
//         console.log("Error starting a conversation: " + error.message)
//     }
//     return generatedThread
// }

// export async function pickAnAssistant() {
//     let assistants = []
//     try {
//         assistants = await openai.beta.assistants.list({
//             order: "desc",
//             limit: 10
//         })
//     } catch (error) {
//         console.log("Error picking an assistant: " + error.message)
//     }
//     return assistants?.body?.first_id
// }


// export async function getMessagesInThread(threadID) {
//     let threadMessages = []
//     try {
//         threadMessages = await openai.beta.threads.messages.list(threadID)
//         // sort for most recent messages
//         threadMessages.data.sort((a, b) => b.created_at - a.created_at)
//     } catch (error) {
//         console.log("Error getting messages in a thread: " + error.message)
//     }
//     return threadMessages.data
// }


// export async function runThread(threadID) {
//     let response = null
//     try {
//         response = await openai.beta.threads.runs.create(
//             threadID,
//             { assistant_id: await pickAnAssistant() }
//         )
//     } catch (error) {
//         console.log("Error running messages in a thread: " + error.message)
//     }
//     return response
// }
