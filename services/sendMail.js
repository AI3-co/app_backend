import { EmailClient, KnownEmailSendStatus } from "@azure/communication-email";
import fs from 'fs'

const connectionString = "endpoint=https://ai3-communication-services.unitedstates.communication.azure.com/;accesskey=q/xPVE1IUfzRVDh1+2GfXAHkAxT2Mjipr5QM1sPf8R7P7JDm6hxjzcSif/JZEnFFeJAjNTdsXObnQ1YocKaPrg=="
// const connectionString = process.env["ACS_COMMUNICATION_STRING"]
const senderAddress = "donotreply@ai3.co"
const recipientAddress = "joeycharlesworth@gmail.com"

const createEmailBody = () => {
    let emailBody = "<html><body>"
    emailBody += "<div style='background: #E5E5E5; color=#0F0000; padding: 10px; border-radius: 2px'>This a test mail from AI3 domain. <br> <img style='border-radius: 10px; border: 1px solid #ddd' src='https://media.istockphoto.com/id/633114032/photo/happy-smiling-man-giving-thumbs-up.jpg?s=612x612&w=0&k=20&c=scmM6DY6mPrOa5zN_O_DjeQ6OEOIZBWUMxexooxhgq8='></div>"
    emailBody += "</body></html>"
    return emailBody
}

const sendEmail = async () => {
    const POLLER_WAIT_TIME = 10
    const message = {
        senderAddress,
        recipients: {
            to: [
                {
                    address: recipientAddress,
                    displayName: "Joseph CharlesWorth"
                }
            ]
        },
        content: {
            subject: "AI3 Email Test",
            plainText: "This is a plain text test email from Node Backend and Azure Communication Services",
            html: createEmailBody()
        }
    }
    try {
        const client = new EmailClient(connectionString)
        const poller = await client.beginSend(message)

        if (!poller.getOperationState().isStarted) {
            throw new Error("Poller is not started")
        }

        let timeElapsed = 0
        while (!poller.isDone()) {
            await poller.poll()
            console.log(`Email sending in progress, waiting for ${timeElapsed} seconds`)

            await new Promise(resolve => setTimeout(resolve, POLLER_WAIT_TIME * 1000))
            timeElapsed += POLLER_WAIT_TIME

            if (timeElapsed > 18 * POLLER_WAIT_TIME) {
                throw new Error("Email sending timed out")
            }
        }

        if (poller.getResult()?.status === KnownEmailSendStatus.Succeeded) {
            console.log("Email sent successfully", poller.getResult())
        } else {
            throw poller.getResult()?.error
        }

    } catch (error) {
        console.error("Error sending email: ", error)
    }
}

sendEmail()
