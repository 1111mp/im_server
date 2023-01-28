namespace RoleModel {
  interface Permission {
    id: number;
    name: string;
    id: string;
  }

  interface Role {
    roleId: number;
    roleName: string;
    roleDesc: string;
    permissions: Permission[];
  }
}
