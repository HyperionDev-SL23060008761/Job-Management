//External Imports
import { useState } from "react";
import { toast } from "react-toastify";

//Internal Imports
import { Job, JobFilter, JobUpdateParameters } from "../types/types";
import getJobs from "../api/getJobs";
import createJob from "../api/createJob";
import { deepCopy } from "../utils";
import JobItem from "../components/JobItem";
import bulkUpdateJobs from "../api/bulkUpdateJobs";

//Setup the Page
export default function Home() {
	//Setup the State
	const [jobs, setJobs] = useState<Array<Job>>();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>();
	const [editingJobs, setEditingJobs] = useState<Map<string, Job>>(new Map());

	//Load the Jobs if the Jobs List is Invalid and the no error has occured or is loading
	if (!jobs && !error && !isLoading) loadJobs();

	//Loads the List of Jobs
	async function loadJobs(filter?: JobFilter) {
		//Reset the Editing Jobs
		setEditingJobs(new Map());

		//Update the Loading Status
		setIsLoading(true);

		//Get the Job List
		const jobList = await getJobs(undefined, filter);

		//Check if the Job List is Invalid
		if (jobList instanceof Error) {
			//Update the Loading Status
			setIsLoading(false);

			//Toast the Error
			toast.error("Unable to Load the Jobs");

			//Set the Error Status
			return setError(jobList);
		}

		//Mark the Jobs as being an Array of Jobs
		setJobs(jobList as Array<Job>);

		//Update the Loading Status
		setIsLoading(false);

		//Update the Error Status
		setError(null);
	}

	//Handles Filter Change Events
	function handleFilterChange(event: React.ChangeEvent<HTMLSelectElement>) {
		//Get the Selected Filter
		const selectedFilter = event.currentTarget.value as JobFilter;

		//Load the New Jobs with the Selected Filter
		loadJobs(selectedFilter);
	}

	//Handle Submit Events
	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		//Prevent the Default Behavior of the Submit Event
		event.preventDefault();

		//Update the Loading Status
		setIsLoading(true);

		//Get the Target Element
		const targetElement = event.currentTarget;

		//Get the Form Values
		const description = targetElement.description.value;
		const location = targetElement.location.value;
		const priority = targetElement.priority.value;

		//Check if the Form Values are Invalid
		if (!description || !location || !priority) {
			//Toast the Error
			toast.error("Invalid Form Values");

			//Throw an Error
			throw new Error("Invalid Form Values");
		}

		//Setup the New Job
		const newJob: JobUpdateParameters = {
			description: description,
			location: location,
			priority: priority,
		};

		//Create the New Job
		const createdJob = await createJob(newJob);

		//Check if the Job could not be Created
		if (createdJob instanceof Error) {
			//Update the Loading Status
			setIsLoading(false);

			//Toast the Error
			toast.error("Unable to Create Job");

			//Set the Error
			return setError(createdJob);
		}

		//Setup the New Job List
		const newJobs = jobs ? [...jobs, createdJob] : [createdJob];

		//Toast the Successfull Creating of the Job
		toast.success("The Job was Created Successfully");

		//Update the Jobs in the State
		setJobs(newJobs);

		//Update the Loading Status
		setIsLoading(false);

		//Update the Error Status
		setError(null);
	}

	//Handles Job Update Events
	async function handleJobUpdate(updatedJob: Job): Promise<void> {
		//Check if the Job List is Invalid and Setup a new List
		if (!jobs) return setJobs([updatedJob]);

		//Setup the New Job List
		const newJobs = deepCopy(jobs);

		//get the index for the Outdated Job
		const outdatedJobIndex = newJobs.findIndex(job => job._id === updatedJob._id);

		//Update the Outdated Job
		newJobs.splice(outdatedJobIndex, 1, updatedJob);

		//Update the Job List
		setJobs(newJobs);
	}

	//Handles Job Remove Events
	async function handleJobRemove(jobID: string): Promise<void> {
		//Check if the Job List is Invalid and Setup a new List
		if (!jobs) return setJobs([]);

		//Setup the New Job List
		const newJobs = deepCopy(jobs.filter(job => job._id !== jobID));

		//Update the Job List
		setJobs(newJobs);
	}

	//Handles Pending Updates
	async function handlePendingUpdates(jobID: string, updates: Job | null) {
		//Setup the New Editing Jobs Map
		const newEditingJobs = new Map(editingJobs);

		//Check if the Updates is Invalid and Remove the Job from the map
		if (!updates) newEditingJobs.delete(jobID);

		//Check if the Updates are give and add the Job to the map
		if (updates) newEditingJobs.set(jobID, updates);

		//Update the Editing Jobs State
		setEditingJobs(newEditingJobs);
	}

	//Handles Bulk Save Click Event
	async function handleBulkSave() {
		//Check if the Job List does not contain enough Items
		if (editingJobs.size < 2) return;

		//Get the Job Array from the Editing Jobs
		const updatedJobs = Array.from(editingJobs.values());

		//Update the Jobs
		const result = await bulkUpdateJobs(updatedJobs);

		//Check if the Update Failed
		if (result instanceof Error) {
			//Toast the Error
			toast.error("Unable to Update All of the Jobs");

			//Set the Error
			return setError(result);
		}

		//Toast the Successful Update
		toast.success("The Jobs were Updated Successfully");

		//Load the Jobs Again
		loadJobs();

		//Dispatch the Bulk Update Event
		dispatchEvent(new Event("bulk-update"));
	}

	//Return the Page's Content
	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Job Management</h1>

			{/* Job Submission Form */}
			<div className="card p-4 mb-4">
				<form onSubmit={handleSubmit}>
					<div className="grid grid-cols-2 gap-4">
						<input
							type="text"
							name="description"
							placeholder="Description"
							className=" p-2 rounded-sm bg-gray-800"
						/>

						<input
							type="text"
							name="location"
							placeholder="Location"
							className=" p-2 rounded-sm bg-gray-800"
						/>

						<select name="priority" className=" p-2 rounded-sm bg-gray-800 cursor-pointer">
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
						</select>

						<button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
							Create Job
						</button>
					</div>
				</form>
			</div>

			{/* Job List */}
			<div className="card p-4 mb-4">
				<div className="flex justify-between">
					{/* Job Filters */}
					<div className="mb-2">
						<select
							onChange={handleFilterChange}
							className="bg-gray-800 px-2 py-1 rounded-sm cursor-pointer"
						>
							<option value="all">All</option>
							<option value="submitted">Submitted</option>
							<option value="in-progress">In-Progress</option>
							<option value="completed">Completed</option>
						</select>
					</div>

					{/* Bulk Save Button (Only if there are more than 1 Jobs Being Edited) */}
					{editingJobs.size > 1 && (
						<div className="mb-2">
							<button
								id="bulkSaveButton"
								onClick={handleBulkSave}
								className="bg-blue-500 text-white py-2 px-4 rounded"
							>
								Bulk Save
							</button>
						</div>
					)}
				</div>

				<table className="flex flex-col">
					<thead className="flex flex-col">
						<tr className="flex pl-3 py-3">
							<th className="text-center w-full">Description</th>
							<th className="text-center w-full">Location</th>
							<th className="text-center w-full">Priority</th>
							<th className="text-center w-full">Status</th>
							<th className="text-center w-full">Actions</th>
						</tr>
					</thead>
					<tbody className="flex flex-col gap-1">
						{jobs &&
							jobs.map(job => (
								<JobItem
									key={job._id}
									job={job}
									onRemove={handleJobRemove}
									onUpdate={handleJobUpdate}
									onPendingUpdate={handlePendingUpdates}
								/>
							))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
