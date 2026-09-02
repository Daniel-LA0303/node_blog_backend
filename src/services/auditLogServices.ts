import { LogInput } from "../interfaces/auditlog.interfaces";
import { AuditLog } from "../models/AuditLog";

const createAuditLogService = async ({
    actor,
    action,
    category,
    target,
    req
}: LogInput) => {

    const formattedRoles: string[] = actor.roles.map((r: any) =>
        typeof r === 'string' ? r : r.name
    );
    await AuditLog.create({
        actor: {
            user: actor._id,
            name: actor.name,
            email: actor.email,
            roles: formattedRoles
        },
        action,
        category,
        target,
        ipAddress: req?.ip || req?.headers['x-forwarded-for']
    });

}

export default {
    createAuditLogService
}