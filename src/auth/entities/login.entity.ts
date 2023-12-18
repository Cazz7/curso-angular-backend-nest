import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Login {

    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ required: true, minlength: 6 })
    password?: string;

}

export const UserSchema = SchemaFactory.createForClass(Login);