import { ConflictException, Injectable, Req } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/user.dto';
import { ConfirmUserDto } from './dto/confirm.dto';
// import { Request, Response } from 'express';
import { PrismaService } from 'src/chatapp/prisma/prisma.service';
import { use } from 'passport';
import { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
    constructor (private readonly prisma: PrismaService){}
    async create(dto: CreateUserDto)
    {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            }
        });
        if (user)
            throw new ConflictException('email duplicated');
            const newUser = await this.prisma.user.create({
                data:{
                    ...dto,
                    hash: await bcrypt.hash(dto.hash, 10),
                    title: "snouae rfa3 ta7di",
                    profilePic: "https://i.imgur.com/GJvG1b.png",
                    wallet:10,
                },
            });
        const {hash, ...result} = newUser;
        return result;
    }
    
    async findByEmail(email: string) 
    {
        return await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
    }
    
    async findById(id: string) 
    {
        return await this.prisma.user.findUnique({
            where: {
                id: id,
            },
        });
    }

    async allUsers()
    {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
            },
        });
        return users;
    }

    async confirm(email: string, dto: ConfirmUserDto)
    {
        const existingUser = await this.prisma.user.findUnique({
        where: { username: dto.username },
        });
        if (existingUser && existingUser.email !== email) {
        throw new ConflictException(`Username ${dto.username} already exists`);
        }
        const user = await this.prisma.user.update({
            where: { email: email },
            data: {
                ...dto,
                hash: await bcrypt.hash(dto.hash, 10)
            },
        })
    }

    async allFriend(userId: string)
    {
        try
        {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { friends: true },
            });

            if (!user)
                throw new Error('User not found');
            return user.friends;
        }
        catch (error)
        {
            return {error: 'Internal server error'}
        }
    }

    async removeFriend(userId: string, friendId: string) {
        try {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            const friend = await this.prisma.user.findUnique({ where: { id: userId } });

            if (!user || !friend)
                throw new Error('User not found');
            await this.prisma.user.update(
                {
                    where: { id: userId },
                    data: {
                        friends: {
                            disconnect:
                            {
                                id: friendId
                            }
                        }
                    }
                })
        } catch (error)
        {
            return {error: 'Internal server error'}
        }
    }
    

    async Searchuser(username: string, @Req() req: Request)
    {
        try {
            const user = req['user'] as User;
            const userloged = user.id;
            const users = await this.prisma.user.findMany({
                where: {
                    username: {
                        startsWith: username,
                        mode: 'insensitive',
                    },
                    NOT : {id: userloged},
                }
            })
        if (!users || users.length === 0) {
        return { error: 'No users found' };
    }
        return(users);
        } catch (error)
        {
            return {error: 'Internal server error'}
        }
    }
}