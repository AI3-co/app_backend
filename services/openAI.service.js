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

export async function createOAIThread() {
    try {
        const emptyThread = await openai.beta.threads.create()
        console.log('formedThread=>()', { data: emptyThread, success: true })
        return { data: emptyThread, success: true }
    } catch (error) {
        return {
            error: 'Error creating thread',
            success: false,
            message: error.message
        }
    }
}

export async function createThreadMessage(threadID, message) {
    try {
        const threadMessages = await openai.beta.threads.messages.create(threadID, { role: 'user', content: message })
        console.log('newMessage=>()', { data: threadMessages, success: true })
        return { resource: threadMessages, success: true }
    } catch (error) {
        return {
            error: 'Error creating thread message',
            success: false,
            message: error.message
        }
    }
}

export async function retrieveRun(threadID, runID) {
    try {
        console.log({ threadID, runID })
        const retrievedRun = await openai.beta.threads.runs.retrieve(threadID, runID)
        console.log('retrieveRunThread=>()', { data: retrievedRun, success: true })
        return { resource: retrievedRun, success: true }
    } catch (error) {
        return {
            error: 'Error fetching run on thread',
            success: false,
            message: error.message
        }
    }
}

export async function runAssistantOnThread(threadID, assistantID) {
    try {
        console.log({ threadID, assistantID })
        const aiResponse = await openai.beta.threads.runs.create(threadID, { assistant_id: assistantID })
        console.log('runAssistantOnThread=>()', { data: aiResponse, success: true })
        const threadMessages = await fetchThreadMessages(threadID)
        return { resource: { runResponse: aiResponse, messages: threadMessages.resource }, success: true }
    } catch (error) {
        return {
            error: 'Error running assistant on thread',
            success: false,
            message: error.message
        }
    }
}

// export async function fetchThreadRun() {
//     try {
//         const threadRun = await openai.beta.threads.runs.retr
//     } catch (error) {
//         return {
//             error: 'Error running assistant on thread',
//             success: false,
//             message: error.message
//         }
//     }
// }

export async function fetchThreadMessages(threadID) {
    try {
        const threadMessages = await openai.beta.threads.messages.list(threadID)
        console.log('fetchThreadMessages=>()', { data: threadMessages.data.length })
        return { resource: threadMessages.data, success: true }
    } catch (error) {
        return {
            error: 'Error fetching thread messages',
            success: false,
            message: error.message
        }
    }
}
