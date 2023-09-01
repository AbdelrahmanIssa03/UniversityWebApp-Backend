import bcrypt from 'bcrypt'

export const passwordHashing = async (password : string) => {
    const hashedPassword = await bcrypt.hash(password,12);
    return hashedPassword
}
export const checkPassword = async (password : string, hashedPassword : string) => {
    return await bcrypt.compare(password, hashedPassword)
}