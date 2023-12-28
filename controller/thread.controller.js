import Helper from "../helpers/helpers.js";
import { createResource, getAllResourceAndPopulateRefFields, getAllResources, getResourceById, getSingleResourceAndPopulateFields, pushUpdatesToResource, updateResource } from "../repos/db.js";
import User from "../models/user.model.js"
import Assistant from "../models/assistant.model.js"
import Message from "../models/message.model.js"
import Thread from "../models/thread.model.js"
import Team from "../models/team.model.js"
import { createOAIThread, createThreadMessage, fetchThreadMessages, runAssistantOnThread } from "../services/openAI.service.js";

const helper = new Helper()

class ThreadController {
    async createThread(req, res, next) {
        /**
         * 1 - Create a thread on ai3 & openai
         * 2 - Add this thread to the Team's thread
         */
        try {
            const user = req.user
            const teamID = req.body.teamID
            if (!user) throw new Error('You need to login to create threads')

            if (!teamID) throw new Error('Threads can only be created under teams')
            const oaiNewThread = await createOAIThread()
            console.log({ oaiNewThreadee: oaiNewThread })

            if (!oaiNewThread.success) throw new Error('Could not create thread via 3rd party: ' + oaiNewThread.error)

            const threadPayload = {
                createdBy: user.userId,
                oaiThreadID: oaiNewThread.data.id, // newly created openai thread
                team: teamID,
            }

            console.log({ threadPayload })

            const newThread = await createResource(Thread, threadPayload)


            if (!newThread.success) throw new Error('Err creating thread: ' + newThread.error)

            const teamUpdatePayload = {
                fieldToUpdate: 'threads',
                newData: [newThread.resource]
            }

            await pushUpdatesToResource(Team, { id: teamID }, teamUpdatePayload)
            await updateResource(Team, { id: teamID }, { lastVisitedThread: newThread.resource.id })
            await updateResource(Thread, { id: newThread.resource.id }, { team: teamID })

            helper.sendServerSuccessResponse(res, 201, newThread.resource)
        } catch (error) {
            helper.sendServerErrorResponse(res, 401, error, 'Error creating thread')
        }
    }

    async updateThreadWithMessage(req, res, next) {
        /**
         * SETTINGS:
         * - Users will need to select which assistant to use
         * - For now I would assign a default temporary assistant
        * 1. When user updates the thread for that teamus
        * 2. Pick the default assistant, populate it and extract the oaiID and use that to run against the thread
        * 3. Extract the response, add that to the thread and send this response back to the user, so it can be added to the UI
        */
        try {
            const userID = req.user.userId
            const teamID = req.body.teamID
            const threadID = req.params.id

            if (!userID) throw new Error('You need to login for this')

            if (!teamID) throw new Error('Threads can only be updated under teams')

            if (!threadID) throw Error('No Thread ID!')

            const { message } = req.body

            const foundThread = await getResourceById(Thread, { id: threadID })

            if (!foundThread.success) throw Error('Could not find thread: ' + foundThread.error)

            const foundTeam = await getSingleResourceAndPopulateFields(Team, { id: teamID }, ['defaultAssistant'])

            if (!foundTeam.success) throw Error('Could not find team: ' + foundTeam.error)

            console.log({ foundThread, foundTeam })
            const defaultAssistantID = foundTeam.resource.defaultAssistant.openaiID

            /**
             * 1. With thread ID, create a message, and add that message to the thread ✅
             * 2. With the default assistant ID, run an assistant against the thread with the now updated message ✅
             *
             */
            const newThreadMessage = await createThreadMessage(foundThread.resource.oaiThreadID, message)
            if (!newThreadMessage.success) throw Error('Could not create *oai message ' + newThreadMessage.message)

            const newAI3Message = {
                content: message,
                createdBy: req.user.userId,
                oaiMessageID: newThreadMessage.resource.thread_id
            }
            console.log({ newAI3MessagePayload: newAI3Message })


            const newAI3ThreadMessage = await createResource(Message, newAI3Message)

            //console.log({ newAI3ThreadMessage })

            if (!newAI3ThreadMessage.success) throw Error('Could not create ai3 message')

            const recentRunOnThread = await runAssistantOnThread(foundThread.resource.oaiThreadID, defaultAssistantID)

            if (!recentRunOnThread.success) throw Error('Could not run assistant on thread: ' + recentRunOnThread.message)

            console.log({ recentRunOnThread })
            /**
             * 3. Update ai3 thread with this created message from OAI. ✅
             * 4. Send back AI response to client as "assistantResponse"!
             */
            const newMessages = await fetchThreadMessages(foundThread.resource.oaiThreadID)

            console.log({ NEW_MESSAGE: newThreadMessage.resource, NEW_AI3_MESSAGE: newAI3ThreadMessage })

            await pushUpdatesToResource(Thread, { id: threadID }, { fieldToUpdate: 'messages', newData: [newAI3ThreadMessage.resource] })

            //const foundUser = await getResourceById(User, { id: userID })

            helper.sendServerSuccessResponse(res, 200, { messages: newMessages, newlyCreatedMessage: newAI3ThreadMessage })
        } catch (error) {
            helper.sendServerErrorResponse(res, 401, error, 'Error updating thread with messages')
        }
    }

    // This endpoint is called after a run has been done on the threa
    async getAllMessagesWithinThread(req, res) {
        let updateThreadWithLastMessage;
        let allMessages;
        try {
            const threadID = req.params.id
            const threads = await getResourceById(Thread, { id: threadID })
            const oaiThreadID = threads.resource.oaiThreadID
            allMessages = await fetchThreadMessages(oaiThreadID)
            const lastMessage = allMessages.resource[0]
            const ai3LastMessage = threads.resource.messages[threads.resource.messages.length - 1]
            // console.log({ threads: threads.resource.messages[threads.resource.messages.length - 1] })
            /*
            !TODO - eventually => store ai responses as a message first then pass that id into thread as message reference
             */
            if (lastMessage.role === 'assistant' && ai3LastMessage.role !== "assistant" && ai3LastMessage?.content?.[0]?.text?.value !== "") {
                updateThreadWithLastMessage = await pushUpdatesToResource(
                    Thread,
                    { id: threadID },
                    { fieldToUpdate: 'messages', newData: [lastMessage] }
                )
            }

            console.log({ updateThreadWithLastMessage })

            if (!updateThreadWithLastMessage.success) throw new Error('Could not update thread with last message: ' + updateThreadWithLastMessage.error)

            if (!allMessages.resource[0].content[0].text.value)
                allMessages = await fetchThreadMessages(oaiThreadID)
            helper.sendServerSuccessResponse(res, 200, { allMessages: allMessages.resource, lastMessage })
        } catch (error) {
            helper.sendServerErrorResponse(res, 401, error, 'Error getting all thread messages')
        }
    }

    async loadThreadMessages(req, res, next) {
        try {
            const threadID = req.params.thread
            const teamID = req.params.team
            if (!threadID) throw Error('You need a thread')
            const threadMessages = await getSingleResourceAndPopulateFields(Thread, { id: threadID }, ['createdBy'])
            const foundTeam = await getSingleResourceAndPopulateFields(Team, { id: teamID }, ['defaultAssistant'])
            // const threadMessages = await getResourceById(Thread, { id: threadID })

            if (!foundTeam.resource) throw Error('Could not find team')
            if (!threadMessages.success) throw Error('Could not load thread messages')

            const allMessages = threadMessages.resource.messages.map(message => {
                if (message.role) {
                    return {
                        ...message,
                        id: message.id,
                        created_at: message.created_at,
                        content: message.content[0].text.value,
                        createdBy: {
                            name: foundTeam.resource.defaultAssistant.name,
                            team: foundTeam.resource.name
                        }
                    }
                }
                return { role: "user", ...message }
            })
            helper.sendServerSuccessResponse(res, 200, { allMessages, resource: foundTeam.resource }, 'Fetched all threads')
        } catch (error) {
            helper.sendServerErrorResponse(res, 401, error, 'Error loading thread messages')
        }
    }

    async getAllThreads(req, res, next) {
        try {
            // const allThreads = await getAllResourceAndPopulateRefFields(Thread, ['createdBy', 'team'])
            const allThreads = await getAllResources(Thread)
            if (!allThreads.success) throw Error('Could not fetch all threads')
            helper.sendServerSuccessResponse(res, 200, allThreads.resource)
        } catch (error) {
            helper.sendServerErrorResponse(res, 401, error, 'Could not fetch all threads')
        }
    }

    /**
     * Use a conditional to check if assistant, so on loop certain return values can be used
     * E.g. Based on assistant, there are several layers of nesting
     * Arrange the chats based on when created or just reverse the array
     */
    // async loadThreadMessages(req, res, next) {
    //     try {
    //         const threadID = req.params.id

    //         if (!threadID) throw Error('A thread is required')

    //         const threadMessages = await getResourceById(Thread, { id: threadID })

    //         if (!threadMessages.success) throw Error('Could not find thread')

    //         console.log({ threadMessages })

    //         helper.sendServerSuccessResponse(res, 200, threadMessages.resource)
    //     } catch (error) {
    //         helper.sendServerErrorResponse(res, 401, error, 'Error loading thread messages')
    //     }
    // }

    async deleteThread() { }

    async getSingleThread() { }
}

export default ThreadController
