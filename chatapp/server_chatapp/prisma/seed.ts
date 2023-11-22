import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const data = Array.from({length:10}).map(()=>{
    return {
        profilePic: "some link",
        username: faker.helpers.unique(faker.person.firstName),
        title: faker.person.lastName(),
        // userInterface:{
            // create:{}
        // }
    }
})

const prisma = new PrismaClient();

async function main() {

    await prisma.user.createMany({data});
    // for (const user of data){
        // const new_UI =  await prisma.userInterface.create({data:{}});
        // const newUser = await prisma.user.create({
        //     data: {
        //         profilePic: user.profilePic,
        //         username: user.username,
        //         title: user.title,
        //         userInterface: new_UI.id,
        //     }
        // });
    // }
}

main()