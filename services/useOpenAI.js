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
