//Internal Imports
import { JobPriority, JobStatus } from "../types";

//Setup the Job Update Parameters Interface
export interface JobUpdateParameters {
	description?: string;
	location?: string;
	priority?: JobPriority;
	status?: JobStatus;
}
