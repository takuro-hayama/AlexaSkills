import { HandlerInput, SkillBuilders } from 'ask-sdk-core';
import { IntentRequest, SessionEndedRequest } from 'ask-sdk-model';
import { HttpClient, HttpClientResponse } from 'typed-rest-client/HttpClient';

// const endpoint = 'https://6wvsbvia67.execute-api.ap-northeast-1.amazonaws.com/v1/ts/proxy/birthday';
const endpoint = 'https://6wvsbvia67.execute-api.ap-northeast-1.amazonaws.com/v1/ts/proxy';
// const endpoint = "https://6wvsbvia67.execute-api.ap-northeast-1.amazonaws.com/BirthdayStage/ts/proxy/name";

const client = new HttpClient('Birthdays');

interface BirthdayResponse {
    id: number;
    name: string;
    birthday: string;
}

async function getBirthdayInfo(name: string): Promise<BirthdayResponse> {

    let url = encodeURI(`${endpoint}/name/${name}`);
    console.log(url);
    let response: HttpClientResponse = await client.get(url);

    console.log('response');
    // console.log(response.message);

    let body: string = await response.readBody();
    console.log('body');
    console.log(body);

    const birthday = JSON.parse(body) as BirthdayResponse;
    console.log(birthday);
    return birthday;
}

const LaunchRequestHandler = {
    canHandle(handlerInput: HandlerInput) {
        console.log('LaunchRequestHandler　canHandle');
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput: HandlerInput) {
        const title = '誕生日検索';
        const text = 'ようこそ、誕生日検索へ。有名人の誕生日を調べられます。';
        return handlerInput.responseBuilder
            .speak(text)
            .reprompt(text)
            .withSimpleCard(title, text)
            .getResponse();
    }
};

const BirthdaysIntentHandler = {
    canHandle(handlerInput: HandlerInput) {
        // console.log('BirthdaysIntentHandler　canHandle');
        // console.log(handlerInput.requestEnvelope.request.type);
        // const request = handlerInput.requestEnvelope.request as IntentRequest;
        // console.log(request.intent.name);

        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
             && handlerInput.requestEnvelope.request.intent.name === 'Birthdays';
    },
    async handle(handlerInput: HandlerInput) {

        console.log('handle');
        const request = handlerInput.requestEnvelope.request as IntentRequest;
        const slot = request.intent.slots!![ 'whosName' ];
        console.log(slot);
        const resolution = slot.resolutions!!.resolutionsPerAuthority!!.find(resolution => {
            return resolution.status.code === 'ER_SUCCESS_MATCH';
        })!!;
        const name = resolution.values[ 0 ].value.name;
        // const name = slot.value
        const birthday = await getBirthdayInfo(name);
        const title = '誕生日検索';
        const text = `${slot.value}の誕生日は${birthday.birthday}です`;
        return handlerInput.responseBuilder
            .speak(text)
            .withSimpleCard(title, text)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput: HandlerInput) {
        console.log('HelpIntentHandler　canHandle');
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput: HandlerInput) {
        const title = '誕生日検索';
        const text = '有名人の誕生日をお伝えします。例えば、Mr.マリックの誕生日を教えて、と言ってみてください。';
        return handlerInput.responseBuilder
            .speak(text)
            .reprompt(text)
            .withSimpleCard(title, text)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput: HandlerInput) {
        console.log('CancelAndStopIntentHandler　canHandle');

        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput: HandlerInput) {
        const title = '誕生日検索';
        const text = 'ご利用ありがとうございました。';
        return handlerInput.responseBuilder
            .speak(text)
            .withSimpleCard(title, text)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput: HandlerInput) {
        console.log('SessionEndedRequestHandler　canHandle');

        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput: HandlerInput) {
        const request = handlerInput.requestEnvelope.request as SessionEndedRequest;
        console.log(`Session ended with reason: ${request.reason}`);
        // SessionEndedRequest では音声／カード／ディレクティブなどの返答は出来ないが
        // 何か後処理が必要な場合はここで
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle(handlerInput: HandlerInput, error: Error) {
        console.log('ErrorHandler　canHandle');
        return true;
    },
    handle(handlerInput: HandlerInput, error: Error) {
        console.log(`Error handled: ${error.message}`);
        return handlerInput.responseBuilder
            .speak('すいません。もう一度おっしゃってみてください。')
            .reprompt('すいません。もう一度おっしゃってみてください。')
            .getResponse();
    }
};

const skillBuilder = SkillBuilders.custom();

exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequestHandler,
        BirthdaysIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();