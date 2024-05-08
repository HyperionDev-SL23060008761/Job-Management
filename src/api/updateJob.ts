//Internal Imports
import { Job, JobUpdateParameters } from "../types/types";

//Setup the API URL
const apiURL = "http://localhost:3000/job";

//Updates a Job using the API
export default async function createJob(
	jobID: string,
	updatedJobData: JobUpdateParameters
): Promise<Job | Error> {
	//Setup the Full URL
	const url = `${apiURL}?id=${jobID}`;

	//Setup the Request Options
	const requestOptions: RequestInit = {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(updatedJobData),
	};

	//Update the Job using the API
	const response = await fetch(url, requestOptions).catch(error => new Error(error.message));

	//Check if the Response is a Type of Error
	if (response instanceof Error) return response;

	//Check if the Update Errored
	if (!response.ok) return new Error(response.status.toString());

	//Get the Updated Job from the Response
	const updatedJob: Job = await response.json();

	//Return the Updated Job
	return updatedJob;
}
