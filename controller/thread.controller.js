import Helper from "../helpers/helpers.js";
import { createResource, getAllResourceAndPopulateRefFields, getAllResources, getResourceById, getSingleResourceAndPopulateFields, pushUpdatesToResource, updateResource } from "../repos/db.js";
import User from "../models/user.model.js"
import Assistant from "../models/assistant.model.js"
import Message from "../models/message.model.js"
import Thread from "../models/thread.model.js"
import Team from "../models/team.model.js"
import { createOAIThread, createThreadMessage, fetchThreadMessages, runAssistantOnThread } from "../services/openAI.service.js";
import { MESSAGE_ENTITY_ROLE } from "../helpers/enum.js"

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

            if (!newThread.success && !newThread.resource) throw new Error('Could not create thread: ' + newThread.error)

            const teamUpdatePayload = {
                fieldToUpdate: 'threads',
                newData: [newThread.resource]
            }

            console.log({ teamUpdatePayload })
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

            // console.log({ foundThread, foundTeam })
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
                oaiMessageID: newThreadMessage.resource.thread_id,
                thread: threadID,
                role: "user"
            }
            console.log({ newAI3MessagePayload: newAI3Message })

            const newAI3ThreadMessage = await createResource(Message, newAI3Message)

            if (!newAI3ThreadMessage.success) throw Error('Could not create ai3 message')

            const recentRunOnThread = await runAssistantOnThread(foundThread.resource.oaiThreadID, defaultAssistantID)

            if (!recentRunOnThread.success) throw Error('Could not run assistant on thread: ' + recentRunOnThread.message)

            // console.log({ recentRunOnThread })
            /**
             * 3. Update ai3 thread with this created message from OAI. ✅
             * 4. Send back AI response to client as "assistantResponse"!
             */
            const newMessages = await fetchThreadMessages(foundThread.resource.oaiThreadID)

            // console.log({ NEW_MESSAGE: newThreadMessage.resource, NEW_AI3_MESSAGE: newAI3ThreadMessage })



            const saveResponseToThread = await pushUpdatesToResource(Thread, { id: threadID }, { fieldToUpdate: 'messages', newData: [newAI3ThreadMessage.resource] })
            console.log({ saveResponseToThread, newAI3ThreadMessage })

            if (!saveResponseToThread.success) throw Error('Could not save response to thread: ' + saveResponseToThread.message)


            //const foundUser = await getResourceById(User, { id: userID })

            helper.sendServerSuccessResponse(res, 200, { messages: newMessages, teamID, threadID, userID })
        } catch (error) {
            helper.sendServerErrorResponse(res, 401, error, 'Error updating thread with messages')
        }
    }

    // This endpoint is called after a run has been done on the thread
    async getAllMessagesWithinThread(req, res) {
        let updateThreadWithLastMessage;
        let allThreadMessages;
        let aiResponse;
        try {
            const threadID = req.params.id
            const threads = await getSingleResourceAndPopulateFields(Thread, { id: threadID }, ['messages'])
            const teamID = threads.resource.team
            const foundTeam = await getSingleResourceAndPopulateFields(Team, { id: teamID }, ['defaultAssistant'])
            console.log({ threadHERE: threads, team: foundTeam.resource })

            const oaiThreadID = threads.resource.oaiThreadID
            allThreadMessages = await fetchThreadMessages(oaiThreadID)
            const lastThreadMessage = allThreadMessages.resource[0]
            const ai3LastMessage = threads.resource.messages[threads.resource.messages.length - 1]

            // console.log({ threads: threads.resource.messages, threadID, lastThreadMessage, ai3LastMessage })
            // if (ai3LastMessage.role === MESSAGE_ENTITY_ROLE.ASSISTANT) {
            //     const newAIResponse = {
            //         content: lastThreadMessage.content,
            //         createdBy: foundTeam.resource.defaultAssistant._id,
            //         oaiMessageID: lastThreadMessage.oaiMessageID,
            //         thread: threadID,
            //         role: MESSAGE_ENTITY_ROLE.ASSISTANT
            //     }
            // }
            /*
            !TODO - eventually => store ai responses as a message first then pass that id into thread as message reference
             */
            // if (lastThreadMessage.role === 'assistant' && ai3LastMessage.role !== "assistant" && ai3LastMessage?.content?.[0]?.text?.value !== "") {
            console.log({ hasText: ai3LastMessage?.content?.[0]?.text?.value, lastThreadMessage, ai3LastMessage, allThreadMessages: allThreadMessages.resource[0], oaiThreadID })
            if (ai3LastMessage.role === MESSAGE_ENTITY_ROLE.USER) {
                console.log('saving ai response')
                aiResponse = {
                    content: allThreadMessages.resource[0].content[0].text.value,
                    createdBy: foundTeam.resource.defaultAssistant._id,
                    oaiMessageID: allThreadMessages.resource[0].thread_id,
                    thread: threadID,
                    role: MESSAGE_ENTITY_ROLE.ASSISTANT
                }
                const createAIResponse = await createResource(Message, aiResponse)
                if (!createAIResponse.success) throw Error('Could not create ai3 message' + createAIResponse.error)
                console.log({ createAIResponse })
                updateThreadWithLastMessage = await pushUpdatesToResource(
                    Thread,
                    { id: threadID },
                    { fieldToUpdate: 'messages', newData: [createAIResponse.resource._id] }
                )
                console.log({ updateThreadWithLastMessage, aiResponse })
                if (!updateThreadWithLastMessage.success) throw Error('Could not update thread with last message: ')
                // const aiResponse = {
                //     content: ai3LastMessage.content[0].text.value,
                //     createdBy: req.user.userId,
                //     oaiMessageID: newThreadMessage.resource.thread_id,
                //     thread: threadID,
                //     role: "user"
                // }
                // const newAIResponseMsg = await createResource(Message, lastThreadMessage)
                // if (!newAIResponseMsg.success) throw Error('Could not create ai3 message')
                // console.log({ newAIResponseMsg })
            }
            // const aiResponse = {
            //     content: ai3LastMessage.content[0].text.value,
            //     createdBy: req.user.userId,
            //     oaiMessageID: ai3LastMessage.thread_id,
            //     thread: threadID,
            //     role: MESSAGE_ENTITY_ROLE.ASSISTANT
            // }
            // if (!updateThreadWithLastMessage.success) throw Error('Could not update thread with last message: ')
            const testLoad = {
                lastThreadMessage,
                allThreadMessages,
                ai3LastMessages: threads.resource.messages
            }

            if (!allThreadMessages.resource[0].content[0].text.value)
                allThreadMessages = await fetchThreadMessages(oaiThreadID)

            // console.log({ lastThreadMessage, ai3LastMessage, updateThreadWithLastMessage, content: ai3LastMessage.content[0] })
            helper.sendServerSuccessResponse(res, 200, { aiResponse, allThreadMessages: allThreadMessages.resource })
        } catch (error) {
            helper.sendServerErrorResponse(res, 401, error, error.message)
        }
    }

    async loadThreadMessages(req, res, next) {
        try {
            const threadID = req.params.thread
            const teamID = req.params.team
            if (!threadID) throw Error('You need a thread')
            // find all Messages that match the threadID
            const threadMessages = await getAllResourceAndPopulateRefFields(Message, [''], { thread: threadID })

            const sortedThreadMessages = threadMessages.resource.sort((a, b) => b.createdAt - a.createdAt)

            const users = await getAllResources(User)
            const assistants = await getAllResources(Assistant)
            const populateCreatedBy = sortedThreadMessages.map(message => helper.handleCreatorPopulation(message, users.resource, assistants.resource))

            console.log({ populateCreatedBy })
            helper.sendServerSuccessResponse(res, 200, populateCreatedBy, 'Fetched all threads')
        } catch (error) {
            console.log({ err: error })
            helper.sendServerErrorResponse(res, 400, error, 'Error loading thread messages')
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

    //         const foundThread = await getResourceById(Thread, { id: threadID })

    //         if (!foundThread.success) throw Error('Could not find thread')

    //         console.log({ foundThread })

    //         helper.sendServerSuccessResponse(res, 200, foundThread.resource)
    //     } catch (error) {
    //         helper.sendServerErrorResponse(res, 401, error, 'Error loading thread messages')
    //     }
    // }

    async deleteThread() { }

    async getSingleThread(req, res) {
        try {
            const threadID = req.params.id
            if (!threadID) throw Error('A thread is required')
            const foundThread = await getSingleResourceAndPopulateFields(Thread, { id: threadID }, ['messages'])
            if (!foundThread.success) throw Error('Could not fetch all threads')
            helper.sendServerSuccessResponse(res, 200, foundThread.resource)
        } catch (error) {
            helper.sendServerErrorResponse(res, 400, error, 'Error fetching all threads')
        }
    }
}

export default ThreadController
