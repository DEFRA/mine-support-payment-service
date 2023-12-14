const processScheduleMessage = require("../../../app/messaging/process-schedule-message");

jest.mock("../../../app/schedule", () => {
  return {
    createSchedule: jest.fn(),
  };
});
const { createSchedule } = require("../../../app/schedule");

jest.mock("../../../app/events", () => jest.fn());
const sendEvent = require("../../../app/events");

jest.mock("adp-messaging");
const { MessageReceiver } = require("adp-messaging");
MessageReceiver.mockImplementation(() => {
  return {
    completeMessage: jest.fn(),
    abandonMessage: jest.fn(),
  };
});

describe("processScheduleMessage", () => {
  let receiver;
  beforeEach(() => {
    receiver = new MessageReceiver();
    MessageReceiver.mockImplementation(() => receiver);
  });

  test("should process a schedule message", async () => {
    const message = {
      body: {
        claimId: "claim123",
        value: 100,
      },
    };
    await processScheduleMessage(message, receiver);
    expect(createSchedule).toHaveBeenCalled();
    expect(receiver.completeMessage).toHaveBeenCalled();
    expect(sendEvent).toHaveBeenCalled();
  });

  test("handle error", async () => {
    const message = {
      body: {
        claimId: "claim123",
        value: 100,
      },
    };
    createSchedule.mockImplementationOnce(() => {
      throw new Error("error");
    });
    await processScheduleMessage(message, receiver);
    expect(createSchedule).toHaveBeenCalled();
    expect(receiver.abandonMessage).toHaveBeenCalled();
  });
});
