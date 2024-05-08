//External Imports
import { Fragment, useState, MouseEvent, useEffect } from "react";
import { toast } from "react-toastify";

//Internal Imports
import { deepCopy } from "../utils";
import { Job, JobPriority, JobStatus, JobUpdateParameters } from "../types/types";
import updateJob from "../api/updateJob";
import deleteJob from "../api/deleteJob";
import archiveJob from "../api/archiveJob";
import EventEmitter from "events";

//Setup the Component
export default function JobItem({
	job,
	onUpdate,
	onRemove,
	onPendingUpdate,
}: {
	job: Job;
	onUpdate: (updatedJob: Job) => void;
	onRemove: (jobID: string) => void;
	onPendingUpdate: (jobID: string, updates: Job | null) => void;
}) {
	//Setup the State
	const [editingJob, setEditingJob] = useState<Job | null>(null);
	const [error, setError] = useState<Error | null>(null);

	//Handles Job Edit Events
	async function handleJobUpdate(clickEvent: MouseEvent<HTMLElement>, job: Job): Promise<void> {
		//Get the Target Element
		const targetElement = clickEvent.currentTarget;

		//Get the Parent Row Element
		const parentRowElement = targetElement.closest("tr");

		//Remove the Job from the Pending Update List
		onPendingUpdate(job._id!, null);

		//Check if the Parent Row Element is Invalid
		if (!parentRowElement) {
			//Toast the Error
			toast.error("The Parent Row Element is Invalid");

			//Set the Error
			throw new Error("The Parent Row Element is Invalid");
		}

		//Get the Description Input Element
		const descriptionElement: HTMLInputElement | null = parentRowElement.querySelector(
			"input[name='description']"
		);

		//Get the Location Input Element
		const locationElement: HTMLInputElement | null =
			parentRowElement.querySelector("input[name='location']");

		//Get the Priority Input Element
		const priorityElement: HTMLSelectElement | null =
			parentRowElement.querySelector("select[name='priority']");

		//Get the Status Input Element
		const statusElement: HTMLSelectElement | null =
			parentRowElement.querySelector("select[name='status']");

		//Check if an Invalid Description Element was provided
		if (!descriptionElement) {
			//Toast the Error
			toast.error("The Description Input Element is Invalid");

			//Set the Error
			throw new Error("The Description Input Element is Invalid");
		}

		//Check if an Invalid Location Element was provided
		if (!locationElement) {
			//Toast the Error
			toast.error("The Location Input Element is Invalid");

			//Set the Error
			throw new Error("The Location Input Element is Invalid");
		}

		//Check if an Invalid Priority Element was provided
		if (!priorityElement) {
			//Toast the Error
			toast.error("The Priority Input Element is Invalid");

			//Set the Error
			throw new Error("The Priority Input Element is Invalid");
		}

		//Check if an Invalid Status Element was provided
		if (!statusElement) {
			//Toast the Error
			toast.error("The Status Input Element is Invalid");

			//Set the Error
			throw new Error("The Status Input Element is Invalid");
		}

		//Get the Updated Data
		const description = descriptionElement.value;
		const location = locationElement.value;
		const priority = priorityElement.value as JobPriority;
		const status = statusElement.value as JobStatus;

		//Setup the Updated Job Data
		const updatedData: JobUpdateParameters = {
			description: job.description !== description ? description : undefined,
			location: job.location !== location ? location : undefined,
			priority: job.priority !== priority ? priority : undefined,
			status: job.status !== status ? status : undefined,
		};

		//Check if all of the Updated Data is empty
		if (
			!updatedData.description &&
			!updatedData.location &&
			!updatedData.priority &&
			!updatedData.status
		) {
			//reset the Editing Job
			setEditingJob(null);

			//Update the Error
			return setError(null);
		}

		//Get the Updated Job
		const updatedJob = await updateJob(parentRowElement.id, updatedData);

		//Check if the Job could not be Updated
		if (updatedJob instanceof Error) {
			//Toast the Error
			toast.error("Job could not be Updated");

			//Set the Error
			return setError(updatedJob);
		}

		//Toast the Successful Update
		toast.success("The Job was Updated Successfully");

		//Run the Job Update Handler
		onUpdate(updatedJob);

		//reset the Editing Job
		setEditingJob(null);

		//Update the Error
		setError(null);
	}

	//Listen for Bulk Update Events
	useEffect(() => {
		//Listen for Bulk Update Events and Clear the Editing Job
		window.addEventListener("bulk-update", () => setEditingJob(null), { once: true });
	});

	//Handles Job Delete Events
	async function handleJobDelete(jobID: string): Promise<void> {
		//Delete the Job
		const deletionResult = await deleteJob(jobID);

		//Check if the Job could not be Deleted
		if (!deletionResult) {
			//Toast the Error
			toast.error("The Job could not be Deleted");

			//Set the Error
			return setError(new Error("The Job could not be Deleted"));
		}

		//Toast the Successful Deletion
		toast.success("The Job was Deleted Successfully");

		//Run the Job Remove Handler
		onRemove(jobID);
	}

	//Handles Job Archive Events
	async function handleJobArchive(jobID: string): Promise<void> {
		//Archive the Job
		const archiveResult = await archiveJob(jobID);

		//Check if the Job could not be Archived
		if (!archiveResult) {
			//Toast the Error
			toast.error("The Job could not be Archived");

			//Set the Error
			return setError(new Error("The Job could not be Archived"));
		}

		//Toast the Successful Archive
		toast.success("The Job was Archived Successfully");

		//Run the Job Remove Handler (Archive is also a remove for the frontend)
		onRemove(jobID);
	}

	//Handle Input Change Events
	function handleInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
		//Prevent Default Events
		event.preventDefault();

		//Check if the editing Job is invalid
		if (!editingJob) return;

		//Setup the Updated Job
		const updatedJob = deepCopy(editingJob);

		//Setup the Different Available Values
		const description = event.target.value;
		const location = event.target.value;
		const priority = event.target.value as JobPriority;
		const status = event.target.value as JobStatus;

		//Update the Jobs's Details
		if (event.target.name === "description") updatedJob.description = description;
		if (event.target.name === "location") updatedJob.location = location;
		if (event.target.name === "priority") updatedJob.priority = priority;
		if (event.target.name === "status") updatedJob.status = status;

		//Update the Job Update Handler
		onPendingUpdate(updatedJob._id!, updatedJob);

		//Update the Editing Job in the State
		setEditingJob(updatedJob);
	}

	//Handles Edit Start Event
	function handleEditStart(job: Job) {
		//Setup the New Job
		const newJob = deepCopy(job);

		//Add the Job to the State
		setEditingJob(newJob);

		//Run the Job Update Handler
		onPendingUpdate(newJob._id!, newJob);
	}

	//Setup the Input Class
	const inputClass =
		"w-full bg-transparent border-b-2 border-blue-500 border-solid outline-none appearance-none disabled:border-transparent text-center";

	//Setup the Select Class
	const selectClass = `p-2 rounded-sm bg-gray-800 cursor-pointer border-b-2 border-blue-500 disabled:border-transparent`;

	//Return the Component's Content
	return (
		<tr id={job._id} className="flex w-full  bg-gray-800" key={job._id}>
			{/*Check if an Error Ocurred */}
			{error && (
				<td className="w-full py-2  text-center bg-red-500 rounded-lg">
					<p className="text-white font-bold text-lg">{error.message}</p>
				</td>
			)}

			{/*Check if no Error has Ocurred */}
			{!error && (
				<Fragment>
					{/*Setup the Job Description as an Input Field (Disabled if not editing the Job)*/}
					<td className="flex justify-center w-full py-2 px-4">
						<input
							className={inputClass}
							type="text"
							name="description"
							placeholder="Enter Description"
							value={editingJob?.description || job.description}
							disabled={!editingJob}
							onChange={handleInputChange}
						/>
					</td>

					{/*Setup the Job Location as an Input Field (Disabled if not editing the Job)*/}
					<td className="flex justify-center w-full py-2 px-4">
						<input
							className={inputClass}
							type="text"
							name="location"
							placeholder="Enter Location"
							value={editingJob?.location || job.location}
							disabled={!editingJob}
							onChange={handleInputChange}
						/>
					</td>

					{/*Setup the Job Priority as an Input Field (Disabled if not editing the Job)*/}
					<td className="flex justify-center w-full py-2 px-4">
						<select
							name="priority"
							className={selectClass}
							onChange={handleInputChange}
							disabled={!editingJob}
							value={editingJob?.priority || job.priority}
						>
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
						</select>
					</td>

					{/*Setup the Job Status as an Input Field (Disabled if not editing the Job)*/}
					<td className="flex justify-center w-full py-2 px-4">
						<select
							name="status"
							className={selectClass}
							onChange={handleInputChange}
							disabled={!editingJob}
							value={editingJob?.status || job.status}
						>
							<option value="submitted">Submitted</option>
							<option value="in-progress">In-Progress</option>
							<option value="completed">Completed</option>
						</select>
					</td>

					{/*Setup the Job Actions Area*/}
					<td className="w-full flex gap-2">
						{/*Check if the Job is not being Edited*/}
						{!editingJob && (
							<Fragment>
								{/*Setup the Edit Job Button, this will change to the editing state when clicked*/}
								<button
									onClick={() => handleEditStart(job)}
									className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold px-2 rounded"
								>
									Edit
								</button>

								{/*Setup the Archive Job Button*/}
								<button
									onClick={() => handleJobArchive(job._id!)}
									className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold px-2 rounded"
								>
									Archive
								</button>

								{/*Setup the Delete Job Button*/}
								<button
									onClick={() => handleJobDelete(job._id!)}
									className="w-full bg-red-500 hover:bg-red-600 text-white font-bold px-2 rounded"
								>
									Delete
								</button>
							</Fragment>
						)}

						{/*Check if the Job is being Edited*/}
						{editingJob && (
							/*Setup the Save Job Button, this will change to the non-editing state when clicked and save the Changes*/
							<button
								id="saveButton"
								onClick={event => handleJobUpdate(event, job)}
								className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
							>
								Save
							</button>
						)}
					</td>
				</Fragment>
			)}
		</tr>
	);
}
