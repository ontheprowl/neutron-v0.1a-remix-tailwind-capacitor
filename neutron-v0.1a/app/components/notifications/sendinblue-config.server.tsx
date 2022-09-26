import * as SibSDK from '@sendinblue/client';


export const apiInstance = new SibSDK.TransactionalEmailsApi();


export const sendTeamEmail = async (email: string, name: string, params: { [x: string]: any }, templateId: number) => {
    apiInstance.setApiKey(SibSDK.TransactionalEmailsApiApiKeys.apiKey, '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');

    const emailRequestResponse = await apiInstance.sendTransacEmail({
        "sender": {
            "name": "Team Neutron",
            "email": "team@neutron.money"
        },
        "to": [
            {
                "email": email,
                "name": name
            }
        ],
        "params": params,
        "templateId": templateId
    }
    );

    return emailRequestResponse.response;
}