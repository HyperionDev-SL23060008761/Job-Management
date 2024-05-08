//Setup the API URL
const apiURL = "http://localhost:3000/archive";

//Deletes a Job using the API
export default async function archiveJob(jobID: string): Promise<boolean | Error> {
	//Setup the Full URL
	const url = `${apiURL}?id=${jobID}`;

	//Setup the Request Options
	const requestOptions: RequestInit = {
		method: "PUT",
	};

	//Fetch the Data from the API
	const response = await fetch(url, requestOptions).catch(error => new Error(error.message));

	//Check if the Response is a Type of Error
	if (response instanceof Error) return response;

	//Check if the Archival Errored
	if (!response.ok) return new Error(response.status.toString());

	//Return Successful Archival
	return true;
}
