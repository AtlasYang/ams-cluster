import { AxiosInstance } from "axios";
import { Member } from "./interface";

export class MemberService {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  async getMyRoleInGroup({ group_id }: { group_id: number }) {
    const res = await this.instance.get(`/member/group/myrole/${group_id}`);
    return res.data.role as number;
  }

  async getMemberByGroupId({
    group_id,
  }: {
    group_id: number;
  }): Promise<Member[]> {
    const res = await this.instance.get(`/member/group/${group_id}`);
    return res.data;
  }

  async getMemberByUserId({ user_id }: { user_id: number }) {
    const res = await this.instance.get(`/member/user/${user_id}`);
    return res.data;
  }

  async addPenaltyPoint({
    member_id,
    penalty_type,
  }: {
    member_id: number;
    penalty_type: number;
  }) {
    const res = await this.instance.post("/member/penalty", {
      member_id,
      penalty_type,
    });
    return res.data;
  }

  async changeRole({
    member_id,
    new_role,
  }: {
    member_id: number;
    new_role: number;
  }) {
    const res = await this.instance.post("/member/role", {
      memberId: member_id,
      newRole: new_role,
    });
    return res.data;
  }

  async removeMember({ member_id }: { member_id: number }) {
    const res = await this.instance.post("/member/remove", {
      memberId: member_id,
    });

    return res.data;
  }
}
