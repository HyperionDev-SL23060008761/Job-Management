//Internal Imports
import { Job, JobUpdateParameters } from "../types/types";

//Setup the API URL
const apiURL = "http://localhost:3000/job";

//Creates a Job using the API
export default async function createJob(newJob: JobUpdateParameters): Promise<Job | Error> {
	//Setup the Full URL
	const url = `${apiURL}`;

	//Setup the Request Options
	const requestOptions: RequestInit = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(newJob),
	};

	//Fetch the Data from the API
	const response = await fetch(url, requestOptions).catch(error => new Error(error.message));

	//Check if the Response is a Type of Error
	if (response instanceof Error) return response;

	//Check if the Creation Errored
	if (!response.ok) return new Error(response.status.toString());

	//Get the Response Data
	const responseData = await response.json();

	//Get the Created Job from the Response
	const createdJob: Job = responseData;

	//Return the Created Job
	return createdJob;
}
