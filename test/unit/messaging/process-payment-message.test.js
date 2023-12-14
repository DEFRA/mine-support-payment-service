const processPaymentMessage = require("../../../app/messaging/process-payment-message");

jest.mock("../../../app/events", () => jest.fn());
const sendEvent = require("../../../app/events");

jest.mock("../../../app/payment", () => {
  return {
    createPayment: jest.fn(),
  };
});
const { createPayment } = require("../../../app/payment");

jest.mock("adp-messaging");
const { MessageReceiver } = require("adp-messaging");
MessageReceiver.mockImplementation(() => {
  return {
    completeMessage: jest.fn(),
    abandonMessage: jest.fn(),
  };
});

describe("process-payment-message", () => {
  let receiver;

  beforeEach(() => {
    receiver = new MessageReceiver();
    MessageReceiver.mockImplementationOnce(() => receiver);
  });

  test("should process a payment message", async () => {
    const message = {
      body: {
        claimId: "claim123",
        value: 100,
      },
    };
    await processPaymentMessage(message, receiver);
    expect(createPayment).toHaveBeenCalledWith(message.body);
    expect(sendEvent).toHaveBeenCalledWith(
      message.body,
      "uk.gov.demo.claim.payment.attached"
    );
    expect(receiver.completeMessage).toHaveBeenCalled();
  });

  test("handle error", async () => {
    const message = {
      body: {
        claimId: "claim123",
        value: 100,
      },
    };
    createPayment.mockImplementationOnce(() => {
      throw new Error("error");
    });
    await processPaymentMessage(message, receiver);
    expect(createPayment).toHaveBeenCalledWith(message.body);
    expect(receiver.abandonMessage).toHaveBeenCalled();
  });
});
