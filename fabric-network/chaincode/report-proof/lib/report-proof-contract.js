'use strict';

const { Contract } = require('fabric-contract-api');
const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');

/**
 * Stores integrity proof only. Patient identity, report contents, biomarkers,
 * and predictions must remain in the application's private database.
 */
class ReportProofContract extends Contract {
    async CreateReportProof(ctx, reportId, reportHash, modelVersion, createdAt) {
        const key = `REPORT:${reportId}`;
        if (await this._exists(ctx, key)) throw new Error(`Report proof ${reportId} already exists`);
        if (!/^[a-f0-9]{64}$/i.test(reportHash)) throw new Error('reportHash must be a SHA-256 hex value');

        const proof = {
            docType: 'trustmedaiReportProof',
            reportId,
            reportHash: reportHash.toLowerCase(),
            modelVersion,
            createdAt,
            status: 'ACTIVE',
            transactionId: ctx.stub.getTxID(),
            issuerMsp: ctx.clientIdentity.getMSPID(),
        };
        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(proof))));
        return stringify(proof);
    }

    async ReadReportProof(ctx, reportId) {
        const proof = await ctx.stub.getState(`REPORT:${reportId}`);
        if (!proof || proof.length === 0) throw new Error(`Report proof ${reportId} does not exist`);
        return proof.toString();
    }

    async VerifyReportProof(ctx, reportId, reportHash) {
        const proof = JSON.parse(await this.ReadReportProof(ctx, reportId));
        return stringify({
            verified: proof.status === 'ACTIVE' && proof.reportHash === reportHash.toLowerCase(),
            status: proof.status,
            reportId: proof.reportId,
            transactionId: proof.transactionId,
            createdAt: proof.createdAt,
            modelVersion: proof.modelVersion,
        });
    }

    async RevokeReportProof(ctx, reportId, reason) {
        const key = `REPORT:${reportId}`;
        const proof = JSON.parse(await this.ReadReportProof(ctx, reportId));
        proof.status = 'REVOKED';
        proof.revokedAt = ctx.stub.getTxTimestamp().seconds.toString();
        proof.revocationReason = reason || 'Not specified';
        proof.revokedByMsp = ctx.clientIdentity.getMSPID();
        await ctx.stub.putState(key, Buffer.from(stringify(sortKeysRecursive(proof))));
        return stringify(proof);
    }

    async GetReportHistory(ctx, reportId) {
        const iterator = await ctx.stub.getHistoryForKey(`REPORT:${reportId}`);
        const history = [];
        for (let entry = await iterator.next(); !entry.done; entry = await iterator.next()) {
            history.push({ transactionId: entry.value.txId, timestamp: entry.value.timestamp, isDelete: entry.value.isDelete });
        }
        await iterator.close();
        return stringify(history);
    }

    async _exists(ctx, key) {
        const value = await ctx.stub.getState(key);
        return value && value.length > 0;
    }
}

module.exports = ReportProofContract;
