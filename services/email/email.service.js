import { EmailClient, KnownEmailSendStatus } from "@azure/communication-email";

// CONSTANTS
const CONNECTION_STRING = process.env["ACS_COMMUNICATION_STRING"];

// CONFIG
const senderAddress = "donotreply@ai3.co"

/**
 * 
 * @param {HTMLElement} html body of the email
 * @param {String} recipientEmail email of the recipient
 * @param {String} recipientName name of the recipient
 * @param {String} subject title heading of email
 */
export const sendEmail = async (html, recipientEmail, recipientName, subject) => {
    const client = new EmailClient(CONNECTION_STRING);
    const message = {
        senderAddress,
        recipients: {
            to: [
                {
                    address: recipientEmail,
                    displayName: recipientName
                },
            ],
        },
    };

    message.content = {
        subject,
        html,
    };

    try {
        const poller = await client.beginSend(message);

        if (!poller.getOperationState().isStarted) {
            throw new Error("Poller is not started");
        }

        let timeElapsed = 0;
        while (!poller.isDone()) {
            await poller.poll();
            console.log(`Email sending in progress, waiting for ${timeElapsed} seconds`);

            await new Promise(resolve => setTimeout(resolve, 10000));
            timeElapsed += 10;

            if (timeElapsed > 180) {
                throw new Error("Email sending timed out");
            }
        }

        if (poller.getResult()?.status === KnownEmailSendStatus.Succeeded) {
            console.log("Email sent successfully", poller.getResult());
        } else {
            throw poller.getResult()?.error;
        }
    } catch (error) {
        console.error('Error sending email', error)   
    }
}