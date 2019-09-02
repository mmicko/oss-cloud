"use strict";

var gitHubApiService = require("./gitHubApiService.js");
var databaseService = require("./databaseService.js");

module.exports.hello = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v1.0! Your function executed successfully!",
        input: event
      },
      null,
      2
    )
  };
};

// add a contributor to database if he does not already exist and is registered on GitHub
// POST expected json
// {
//    username: string
//    firstName: string
//    lastName: string
// }
module.exports.addContributor = async (event, context, callback) => {
  // check if request is valid
  try {
    // TODO create generic function for checking validity of a body
    let body = JSON.parse(event.body);
    if (Object.keys(body).length !== 3) {
      throw "Invalid number of attributes in JSON";
    }
  } catch (err) {
    console.log(err);
    response = {
      statusCode: 400,
      body: JSON.stringify({ message: err.message })
    };
    return response;
  }

  try {
    if (await databaseService.checkUsername(body.username)) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: "Username is already registered on this platform",
          success: false
        })
      };
    }
    if (!(await gitHubApiService.checkUsername(body.username))) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Username does not exist on GitHub",
          success: false
        })
      };
    }
    await databaseService.addContributor({
      username: body.username,
      name: body.firstName + " " + body.lastName,
      link: "https://github.com/" + body.username,
      contributionCount: 0,
      contributions: []
    });
    // TODO: call scheduler
    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Successfully added contributor",
        success: true
      })
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err.message,
        success: false
      })
    };
  }
};

// returns all pull requests from parents of all forked repos for a single github user
// POST expected json
// {
//    username: string
// }
module.exports.updatePullRequests = async (event, context, callback) => {
  let response;
  try {
    const results = await gitHubApiService.updatePullRequests();
    response = {
      statusCode: 200,
      body: results.toString() + " contributors updated"
    }

  } catch (error) {
    console.log("error in getPullRequests handler: ", error);
    response = {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message
      })
    };
  } finally {
    return response;
  }
};
