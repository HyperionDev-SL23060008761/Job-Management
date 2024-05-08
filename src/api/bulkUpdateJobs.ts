//Internal Imports
import { Job } from "../types/types";

//Setup the API URL
const apiURL = "http://localhost:3000/bulkUpdate";

//Updates a Job using the API
export default async function bulkUpdateJobs(updatedJobs: Array<Job>): Promise<Boolean | Error> {
	//Setup the Full URL
	const url = `${apiURL}`;

	//Setup the Request Options
	const requestOptions: RequestInit = {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(updatedJobs),
	};

	//Update the Jobs using the API
	const response = await fetch(url, requestOptions).catch(error => new Error(error.message));

	//Check if the Response is a Type of Error
	if (response instanceof Error) return response;

	//Check if the Updates Errored
	if (!response.ok) return new Error(response.status.toString());

	//Return the Successful Update
	return true;
}
