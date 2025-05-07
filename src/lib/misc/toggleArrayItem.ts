export const toggleArrayItem = <T>(item: T, oldArray: T[], setArrayHook: (newArray: T[]) => void) => {
    let newArray = [...oldArray];

    if (newArray.find((tag) => tag === item) !== undefined) {
        // If item exists, remove it
        newArray = newArray.filter(
            (tag) => tag !== item
        );
    } else {
        // If the item doesn't exist, add it
        newArray.push(item);
    }
    setArrayHook(newArray);
}
