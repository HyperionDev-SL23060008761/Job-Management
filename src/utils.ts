//Returns a Deep Copy of an Object
export function deepCopy<ObjectType>(requestedObject: ObjectType): ObjectType {
	//Create the Deep copy of the Requested Object
	const deepCopy = JSON.parse(JSON.stringify(requestedObject)) as ObjectType;

	//Return the Deep Copy
	return deepCopy;
}
