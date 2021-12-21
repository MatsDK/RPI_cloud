import { Resolver, Mutation, Query, Arg } from "type-graphql";
import { Node } from "./SetupNodeInput";
import { CreateDatastoreInput } from "./CreateDatastoreInput";
import { createUser } from "../utils/createUser";
import { getOrCreateConnection } from "../utils/client";
import { ApolloError } from "apollo-server-express";

@Resolver()
export class resolver {
	@Query(() => Boolean)
	ping() {
		return true
	}

	@Mutation(() => Boolean, { nullable: true })
	async setupNode(@Arg("data", () => Node) { loginName, password, token, id }: Node): Promise<boolean | null> {
		const { err } = await createUser(loginName, password)
		if (err) throw new ApolloError(err)

		const conn = getOrCreateConnection();
		conn.id = id;
		conn.token = token;
		conn.saveToken();
		conn.setHeadersCallback();

		return true
	}

	@Mutation(() => Boolean, { nullable: true })
	async connectRequest(): Promise<boolean | null> {
		getOrCreateConnection().connect()

		return true
	}

	@Mutation(() => Boolean)
	async createDatastore(@Arg("data", () => CreateDatastoreInput) { path, groupName, ownerUserName, sizeInMB }: CreateDatastoreInput): Promise<boolean> {
		console.log(path, groupName, ownerUserName, sizeInMB)

		return true
	}
}