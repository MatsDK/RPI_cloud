import { ApolloError } from "apollo-server-core";
import fs from "fs-extra";
import fsPath from "path";
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { Node } from "../../entity/CloudNode";
import { Datastore } from "../../entity/Datastore";
import { isAuth } from "../../middleware/auth";
import { checkPermissions } from "../../middleware/checkPermissions";
import { MyContext } from "../../types/Context";
import { exec } from "../../utils/exec";
import { getOrCreateNodeClient } from "../../utils/nodes/nodeClients";
import { CopyMoveInput } from "./copyMoveMutationInput";
import { CreateDirectoryMutation } from "./CreateDirectoryMutation";
import { DeletePathsInput } from "./deletePathsInput";
import { MoveCopyData } from "./moveCopyData";
import { UpdateOwnershipMutation } from "./UpdateOwnershipMutation";

@Resolver()
export class FolderResolver {
  @UseMiddleware(isAuth, checkPermissions)
  @Mutation(() => String, { nullable: true })
  async createFolder(
    @Arg("datastoreId") datastoreId: number,
    @Arg("path") path: string
  ): Promise<string | null> {
    const datastore = await Datastore.findOne({ where: { id: datastoreId } });
    if (!datastore) return null;

    const node = await Node.findOne({ where: { id: datastore.localNodeId } });
    if (!node) return null;

    try {
      const full_path = fsPath.join(datastore.basePath, path);

      if (node.hostNode) {
        fs.mkdirSync(full_path);

        const cmd = `chown ${node.loginName}:${fsPath.basename(datastore.basePath)} "${full_path}"`;

        await exec(cmd);
      } else {
        const client = await getOrCreateNodeClient({ node, ping: false })
        if (!client) throw new ApolloError("Client not found");

        const { errors, data } = await client.conn.mutate({
          mutation: CreateDirectoryMutation,
          variables: {
            path: full_path,
            datastoreName: fsPath.basename(datastore.basePath),
            loginName: node.loginName
          }
        })

        if (errors || !data.createDir) {
          console.log(errors, data)
          return null
        }
      }
    } catch (error) {
      console.log(error);
      return null;
    }

    return fsPath.join(datastore.basePath, path);
  }

  @UseMiddleware(isAuth, checkPermissions)
  @Mutation(() => Boolean, { nullable: true })
  async delete(
    @Arg("datastoreId") datastoreId: number,
    @Arg("paths", () => [DeletePathsInput]) paths: DeletePathsInput[]
  ): Promise<boolean | null> {
    const datastore = await Datastore.findOne({ where: { id: datastoreId } });
    if (!datastore) return null;

    const node = await Node.findOne({ where: { id: datastore.localNodeId } })
    if (!node) return null

    try {
      if (node.hostNode) {
        for (const { path, type } of paths) {
          const fullPath = fsPath.join(datastore.basePath, path);

          if (type == "file") fs.rmSync(fullPath);
          else fs.rmdirSync(fullPath, { recursive: true });
        }
      } else {
        console.log("delete remote")
      }
    } catch (error) {
      console.log(error);
      return null;
    }

    return true;
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean, { nullable: true })
  copy(@Ctx() { req }: MyContext, @Arg("data") data: CopyMoveInput) {
    return MoveCopyData({ ...data, type: "copy" }, req.userId);
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean, { nullable: true })
  move(@Ctx() { req }: MyContext, @Arg("data") data: CopyMoveInput) {
    return MoveCopyData({ ...data, type: "move" }, req.userId);
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Boolean, { nullable: true })
  async updateOwnership(@Arg("datastoreId") datastoreId: number) {
    const datastore = await Datastore.findOne({ where: { id: datastoreId } })
    if (!datastore) return null

    const node = await Node.findOne({ where: { id: datastore.localNodeId } })
    if (!node) return null

    if (node.hostNode) {
      const { stderr } =
        await exec(`chown ${node.loginName}:${fsPath.basename(datastore.basePath)} ${datastore.basePath}/* -R`)

      if (stderr) {
        console.log(stderr)
        throw new ApolloError(stderr)
      }
    } else {
      const client = await getOrCreateNodeClient({ node, ping: false })

      try {
        const res = await client?.conn.mutate({
          mutation: UpdateOwnershipMutation,
          variables: {
            loginName: node.loginName,
            datastoreName: fsPath.basename(datastore.basePath),
            path: datastore.basePath
          }
        })

        console.log(res)
      } catch (e) {
        console.log(e)
        throw new ApolloError(e as any)
      }
    }

    return true
  }
}
