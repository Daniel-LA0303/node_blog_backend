// generate a random id to confirm or get a new password
const generateID = () => {
    const random = Math.random().toString(32).substring(2);
    const date = Date.now().toString(32);
    return random+date;
}

export default generateID;