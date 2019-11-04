const AWS = require("aws-sdk");
const axios = require("axios");

// Name of a service, any string
const serviceName = process.env.SERVICE_NAME;
// URL of a service to test
const url = process.env.URL;

// CloudWatch client
const cloudwatch = new AWS.CloudWatch();

exports.handler = async event => {
  // TODO: Use these variables to record metric values
  let endTime;
  let requestWasSuccessful;

  const startTime = timeInMs();
  try {
    await axios.get(url);
    requestWasSuccessful = true;
  } catch (e) {
    requestWasSuccessful = false;
  } finally {
    endTime = timeInMs();
  }

  const totalTime = endTime - startTime;

  await cloudwatch
    .putMetricData({
      MetricData: [
        {
          MetricName: "Success",
          Dimensions: [
            {
              Name: "ServiceName",
              Value: serviceName
            }
          ],
          Unit: "Count",
          Value: requestWasSuccessful ? 1 : 0
        }
      ],
      Namespace: "Capecoder/Serveless"
    })
    .promise();

  await cloudwatch
    .putMetricData({
      MetricData: [
        {
          MetricName: "Latency",
          Dimensions: [
            {
              Name: "ServiceName",
              Value: serviceName
            }
          ],
          Unit: "Millisecond",
          Value: totalTime
        }
      ],
      Namespace: "Capecoder/Serveless"
    })
    .promise();
};

function timeInMs() {
  return new Date().getTime();
}
