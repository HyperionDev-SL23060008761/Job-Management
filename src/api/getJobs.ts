import { Job, JobFilter } from "../types/types";

//Setup the API URL
const apiURL = "http://localhost:3000/job";

//Gets a Job (Or list of Jobs) using the API
export default async function getJobs(
	jobID?: string,
	filter?: JobFilter
): Promise<Job | Array<Job> | Error> {
	//Setup the Status (Undefined if filter is all)
	const status = filter === "all" ? undefined : filter;

	//Setup the Full URL
	let url = `${apiURL}?`;

	//Add the ID to the URL if it exists
	if (jobID) url += `id=${jobID}&`;

	//Add the Status to the URL if it exists
	if (status) url += `status=${status}&`;

	//Fetch the Data from the API
	const response = await fetch(url).catch(error => new Error(error.message));

	//Check if the Response is a Type of Error
	if (response instanceof Error) return response;

	//Check if the Retrieval Errored
	if (!response.ok) return new Error(response.status.toString());

	//Get the Data from the Response
	const data = await response.json();

	//Check if the Data is Invalid
	if (!data) return new Error("Requested Job could not be Found");

	//Setup the Jobs
	const jobs = data as Job | Array<Job>;

	//Return the Jobs
	return jobs;
}
