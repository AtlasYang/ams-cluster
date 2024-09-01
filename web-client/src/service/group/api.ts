import { AxiosInstance } from "axios";
import {
  Group,
  GroupCreateDto,
  GroupInvitation,
  GroupInvitationCreateDto,
  GroupListItem,
  GroupRequest,
  GroupRequestCreateDto,
} from "./interface";

export class GroupService {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  async getGroupById({ group_id }: { group_id: number }): Promise<Group> {
    const res = await this.instance.get(`/group/${group_id}`);
    return res.data;
  }

  async getGroupsByUserId({
    user_id,
  }: {
    user_id: number;
  }): Promise<GroupListItem[]> {
    const res = await this.instance.get(`/group/user/${user_id}`);
    return res.data;
  }

  async checkGroupNameAvailable({
    group_name,
  }: {
    group_name: string;
  }): Promise<boolean> {
    console.log(group_name);
    const res = await this.instance.get(`/group/check/${group_name}`);
    console.log(res.data);
    return res.data.available;
  }

  async createGroup({
    name,
    description,
    group_picture_url,
    allow_unapproved_join,
  }: GroupCreateDto): Promise<Group> {
    const res = await this.instance.post("/group", {
      name,
      description,
      group_picture_url,
      allow_unapproved_join,
    });
    return res.data;
  }

  async updateGroup({
    group_id,
    updateData,
  }: {
    group_id: number;
    updateData: Partial<Group>;
  }): Promise<Group> {
    const res = await this.instance.patch(`/group/${group_id}`, updateData);
    return res.data;
  }

  async deleteGroup({ group_id }: { group_id: number }): Promise<void> {
    await this.instance.delete(`/group/${group_id}`);
  }

  async searchGroups({
    group_name_partial,
  }: {
    group_name_partial: string;
  }): Promise<GroupListItem[]> {
    const res = await this.instance.get(`/group/search/${group_name_partial}`);
    return res.data;
  }

  async createGroupInvitation({
    group_id,
    invitee_id,
    invitation_message,
    is_admin_invitation,
  }: GroupInvitationCreateDto): Promise<boolean> {
    const res = await this.instance.post("/group/invitation", {
      group_id,
      invitee_id,
      invitation_message,
      is_admin_invitation,
    });

    if (res.status === 403) {
      return false;
    }

    return true;
  }

  async getGroupInvitationsByUserId({
    user_id,
  }: {
    user_id: number;
  }): Promise<GroupInvitation[]> {
    const res = await this.instance.get(`/group/invitation/user/${user_id}`);
    return res.data;
  }

  async getGroupInvitationsByGroupId({
    group_id,
  }: {
    group_id: number;
  }): Promise<GroupInvitation[]> {
    const res = await this.instance.get(`/group/invitation/group/${group_id}`);
    return res.data;
  }

  async getUnreadGroupInvitationsNumberByGroupId({
    group_id,
  }: {
    group_id: number;
  }): Promise<number> {
    const res = await this.instance.get(
      `/group/invitation/number/group/${group_id}`
    );
    return res.data.num as number;
  }

  async acceptGroupInvitation({
    group_invitation_id,
  }: {
    group_invitation_id: number;
  }): Promise<boolean> {
    const res = await this.instance.post(
      `/group/invitation/accept/${group_invitation_id}`
    );

    if (res.status == 200) {
      return true;
    }

    return false;
  }

  async rejectGroupInvitation({
    group_invitation_id,
  }: {
    group_invitation_id: number;
  }): Promise<boolean> {
    const res = await this.instance.post(
      `/group/invitation/reject/${group_invitation_id}`
    );

    if (res.status == 200) {
      return true;
    }

    return false;
  }

  async readGroupInvitation({
    group_invitation_id,
  }: {
    group_invitation_id: number;
  }): Promise<boolean> {
    const res = await this.instance.patch(
      `/group/invitation/read/${group_invitation_id}`
    );

    if (res.status == 200) {
      return true;
    }

    return false;
  }

  async deleteGroupInvitation({
    group_invitation_id,
  }: {
    group_invitation_id: number;
  }): Promise<boolean> {
    const res = await this.instance.delete(
      `/group/invitation/${group_invitation_id}`
    );

    if (res.status == 200) {
      return true;
    }

    return false;
  }

  async createGroupRequest({
    group_id,
    request_message,
  }: GroupRequestCreateDto): Promise<boolean> {
    const res = await this.instance.post("/group/request", {
      group_id,
      request_message,
    });

    if (res.status == 200) {
      return true;
    }

    return false;
  }

  async getGroupRequestsByGroupId({
    group_id,
  }: {
    group_id: number;
  }): Promise<GroupRequest[]> {
    const res = await this.instance.get(`/group/request/group/${group_id}`);
    return res.data;
  }

  async getGroupRequestsByUserId({
    user_id,
  }: {
    user_id: number;
  }): Promise<GroupRequest[]> {
    const res = await this.instance.get(`/group/request/user/${user_id}`);
    return res.data;
  }

  async getUnreadGroupRequestsNumberByGroupId({
    group_id,
  }: {
    group_id: number;
  }): Promise<number> {
    const res = await this.instance.get(
      `/group/request/number/group/${group_id}`
    );
    return res.data.num as number;
  }

  async acceptGroupRequest({
    group_request_id,
  }: {
    group_request_id: number;
  }): Promise<boolean> {
    const res = await this.instance.post(
      `/group/request/accept/${group_request_id}`
    );

    if (res.status == 200) {
      return true;
    }

    return false;
  }

  async rejectGroupRequest({
    group_request_id,
  }: {
    group_request_id: number;
  }): Promise<boolean> {
    const res = await this.instance.post(
      `/group/request/reject/${group_request_id}`
    );

    if (res.status == 200) {
      return true;
    }

    return false;
  }

  async readGroupRequest({
    group_request_id,
  }: {
    group_request_id: number;
  }): Promise<boolean> {
    const res = await this.instance.patch(
      `/group/request/read/${group_request_id}`
    );

    if (res.status == 200) {
      return true;
    }

    return false;
  }

  async deleteGroupRequest({
    group_request_id,
  }: {
    group_request_id: number;
  }): Promise<boolean> {
    const res = await this.instance.delete(
      `/group/request/${group_request_id}`
    );

    if (res.status == 200) {
      return true;
    }

    return false;
  }

  async quitGroup({ group_id }: { group_id: number }): Promise<boolean> {
    const res = await this.instance.post(`/group/quit/${group_id}`);

    if (res.status == 200) {
      return true;
    }

    return false;
  }

  async getGroupMinutesBySessionId({
    session_id,
  }: {
    session_id: number;
  }): Promise<any> {
    const res = await this.instance.get(`/group/minutes/${session_id}`);
    return res.data;
  }
}
