import Helper from "../helpers/helpers.js";
import { createResource, getAllResourceAndPopulateRefFields, getAllResources, getResourceByField, getResourceById, getSingleResourceAndPopulateFields, pushUpdatesToResource, updateResource } from "../repos/db.js";
import User from "../models/user.model.js"
import Assistant from "../models/assistant.model.js"
import mongoose, { ObjectId } from "mongoose";
import Message from "../models/message.model.js"
import Thread from "../models/thread.model.js"
import { Types } from 'mongoose'
import Team from "../models/team.model.js"
import { createOAIThread, createThreadMessage, fetchThreadMessages, retrieveRun, runAssistantOnThread } from "../services/openAI.service.js";
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
            // console.log({ oaiNewThreadee: oaiNewThread })

            if (!oaiNewThread.success) throw new Error('Could not create thread via 3rd party: ' + oaiNewThread.error)

            const threadPayload = {
                createdBy: user.userId,
                oaiThreadID: oaiNewThread.data.id, // newly created openai thread
                team: teamID,
            }

            // console.log({ threadPayload })

            const newThread = await createResource(Thread, threadPayload)

            if (!newThread.success && !newThread.resource) throw new Error('Could not create thread: ' + newThread.error)

            const teamUpdatePayload = {
                fieldToUpdate: 'threads',
                newData: [newThread.resource]
            }

            // console.log({ teamUpdatePayload, data: teamUpdatePayload.newData })
            await pushUpdatesToResource(Team, { id: teamID }, teamUpdatePayload)
            const updateLastVisited = await updateResource(Team, { id: teamID }, { lastVisitedThread: newThread.resource.id })
            // console.log({ lastVisited: updateLastVisited })

            await updateResource(Thread, { id: newThread.resource.id }, { team: teamID })

            const updatedTeamDetails = await Team.find({ organization: updateLastVisited.resource.organization })
            // console.log({ updatedTeamDetails })

            helper.sendServerSuccessResponse(res, 201, updatedTeamDetails)
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

            console.log({ foundThread, teamID, threadID })

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
            // console.log({ newAI3MessagePayload: newAI3Message })

            const newAI3ThreadMessage = await createResource(Message, newAI3Message)

            console.log({ newAI3ThreadMessage })

            if (!newAI3ThreadMessage.success) throw Error('Could not create ai3 message')

            const recentRunOnThread = await runAssistantOnThread(foundThread.resource.oaiThreadID, defaultAssistantID)

            // console.log({ recentRunOnThread })

            if (!recentRunOnThread.success || !recentRunOnThread.resource) throw Error('Could not run assistant on thread: ' + recentRunOnThread.message)

            // console.log({ recentRunOnThread })
            /**
             * 3. Update ai3 thread with this created message from OAI. ✅
             * 4. Send back AI response to client as "assistantResponse"!
             */
            const newMessages = await fetchThreadMessages(foundThread.resource.oaiThreadID)

            // console.log({ NEW_MESSAGE: newThreadMessage.resource, NEW_AI3_MESSAGE: newAI3ThreadMessage })
            // console.log({ recentRunOnThread: recentRunOnThread.resource })
            const updateThreadRunID = await updateResource(Thread, { id: threadID }, { runID: recentRunOnThread.resource.runResponse.id })
            console.log({ updateThreadRunID })
            const saveResponseToThread = await pushUpdatesToResource(Thread, { id: threadID }, { fieldToUpdate: 'messages', newData: [newAI3ThreadMessage.resource] })
            console.log({ saveResponseToThread, newAI3ThreadMessage })

            if (!saveResponseToThread.success) throw Error('Could not save response to thread: ' + saveResponseToThread.message)

            const users = await getAllResources(User)
            const foundUser = users.resource.filter(user => user._id.toString() === newAI3ThreadMessage.resource.createdBy.toString())[0]

            let userMessage = {
                // content, thread, createdBy, role, oaiMessageID, createdAt, updatedAt, id
                content: newAI3ThreadMessage.resource.content,
                thread: newAI3ThreadMessage.resource.thread,
                oaiMessageID: newAI3ThreadMessage.resource.oaiMessageID,
                role: newAI3ThreadMessage.resource.role,
                createdBy: {
                    firstName: foundUser.firstName,
                    lastName: foundUser.lastName,
                },
                createdAt: newAI3ThreadMessage.resource.createdAt,
                updatedAt: newAI3ThreadMessage.resource.updatedAt,
                id: newAI3ThreadMessage.resource._id
            }
            //const foundUser = await getResourceById(User, { id: userID })

            helper.sendServerSuccessResponse(res, 200, userMessage)
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
            const oaiThreadID = threads.resource.oaiThreadID
            // console.log({ threadHERE: threads, team: foundTeam.resource })

            // const runStatus = await retrieveRun(oaiThreadID, threads.resource.runID)

            // console.log({ runStatus })

            // let isRunComplete = false
            let runStatus = null

            console.log({ preRunStatus: runStatus })
            async function waitUntilRunComplete(threadId, runId) {
                return new Promise(resolve => {
                    const checkRunStatus = async () => {
                        runStatus = await retrieveRun(threadId, runId)
                        if (runStatus.resource.status === 'completed') {
                            resolve()
                        } else {
                            setTimeout(checkRunStatus, 500)
                        }
                    }
                    checkRunStatus()
                })
            }

            await waitUntilRunComplete(oaiThreadID, threads.resource.runID)

            // console.log({ runStage })

            console.log('RunBefore Proceed', { runStatus })

            if (runStatus && runStatus.resource.status === 'completed') {
                allThreadMessages = await fetchThreadMessages(oaiThreadID)
                const lastThreadMessage = allThreadMessages.resource[0]
                const ai3LastMessage = threads.resource.messages[threads.resource.messages.length - 1]
                const defaultAssistantID = foundTeam.resource.defaultAssistant._id

                const assistants = await getAllResources(Assistant)

                const foundAssistant = assistants.resource.filter(assistant => assistant._id.toString() === defaultAssistantID.toString())[0]
                // console.log({ foundAssistant, foundTeam })
                aiResponse = {
                    content: allThreadMessages.resource[0].content[0].text.value,
                    createdBy: {
                        name: foundAssistant.name
                    },
                    oaiMessageID: allThreadMessages.resource[0].thread_id,
                    thread: threadID,
                    role: MESSAGE_ENTITY_ROLE.ASSISTANT
                }
                console.log('saving ai response', { aiResponse: { response: aiResponse } })

                if (ai3LastMessage.role === MESSAGE_ENTITY_ROLE.USER) {
                    console.log('[user]-lastMessage')
                    const createAIResponse = await createResource(Message, { ...aiResponse, createdBy: defaultAssistantID })
                    console.log({ createAIResponse })
                    if (!createAIResponse.success) throw Error('Could not create ai3 message - ' + createAIResponse.error)
                    updateThreadWithLastMessage = await pushUpdatesToResource(
                        Thread,
                        { id: threadID },
                        { fieldToUpdate: 'messages', newData: [createAIResponse.resource._id] }
                    )
                    console.log({ updateThreadWithLastMessage })
                    if (!updateThreadWithLastMessage.success) throw Error('Could not update thread with last message: ')
                }

                console.log('savedAI Response')

            } else {
                console.log('FIRE WAIT RUN', { runStatus })

            }


            console.log('Now Return AI Response', { aiResponse })
            helper.sendServerSuccessResponse(res, 200, { aiResponse }, 'Found all messages in thread')

        } catch (error) {
            helper.sendServerErrorResponse(res, 500, error, error.message)
        }
    }

    async loadThreadMessages(req, res, next) {
        try {
            const threadID = new Types.ObjectId(req.params.thread)
            const teamID = req.params.team
            if (!threadID) throw Error('You need a thread')
            // find all Messages that match the threadID
            console.log({ threadID })
            // const threadMessages = await getAllResources(Message, { thread: threadID })
            const threadMessages = await Message.find({ thread: threadID })
            const singleThread = await getResourceById(Thread, { id: threadID })

            console.log({ singleThread: singleThread.resource })
            console.log({ threadMessages })

            const sortedThreadMessages = threadMessages.sort((a, b) => b.createdAt - a.createdAt)

            const users = await getAllResources(User)
            const assistants = await getAllResources(Assistant)
            const populateCreatedBy = sortedThreadMessages.map(message => helper.handleCreatorPopulation(message, users.resource, assistants.resource))
            // console.log({ loadedMessages: populateCreatedBy[0], })

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
