package com.trustmedai.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.grpc.Grpc;
import io.grpc.ManagedChannel;
import io.grpc.TlsChannelCredentials;
import org.hyperledger.fabric.client.Contract;
import org.hyperledger.fabric.client.Gateway;
import org.hyperledger.fabric.client.Hash;
import org.hyperledger.fabric.client.identity.Identities;
import org.hyperledger.fabric.client.identity.Identity;
import org.hyperledger.fabric.client.identity.Signers;
import org.hyperledger.fabric.client.identity.Signer;
import org.hyperledger.fabric.client.identity.X509Identity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/** Gateway client for the local Fabric network. Only privacy-safe proof fields are submitted. */
@Service
public class FabricLedgerService {
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${fabric.enabled:false}") private boolean enabled;
    @Value("${fabric.msp-id:Org1MSP}") private String mspId;
    @Value("${fabric.channel:mychannel}") private String channelName;
    @Value("${fabric.chaincode:reportproof}") private String chaincodeName;
    @Value("${fabric.peer-endpoint:localhost:7051}") private String peerEndpoint;
    @Value("${fabric.peer-hostname:peer0.org1.example.com}") private String peerHostname;
    @Value("${fabric.network-path:../fabric-network/fabric-samples/test-network}") private String networkPath;
    @Value("${fabric.model-version:trustmedai-models-1.0}") private String modelVersion;

    public boolean isEnabled() { return enabled; }

    public Map<String, Object> createReportProof(Long reportId, String reportHash, Instant createdAt) {
        return submit("CreateReportProof", String.valueOf(reportId), reportHash, modelVersion, createdAt.toString());
    }

    public Map<String, Object> verifyReportProof(Long reportId, String reportHash) {
        return evaluate("VerifyReportProof", String.valueOf(reportId), reportHash);
    }

    private Map<String, Object> submit(String function, String... args) {
        if (!enabled) throw new IllegalStateException("Hyperledger Fabric is disabled. Start the Fabric network and set FABRIC_ENABLED=true.");
        ManagedChannel channel = null;
        try {
            channel = newGrpcConnection();
            try (Gateway gateway = newGateway(channel)) {
            Contract contract = gateway.getNetwork(channelName).getContract(chaincodeName);
            return decode(contract.submitTransaction(function, args));
            }
        } catch (Exception error) {
            throw new IllegalStateException("Fabric ledger transaction failed: " + error.getMessage(), error);
        } finally {
            if (channel != null) channel.shutdownNow();
        }
    }

    private Map<String, Object> evaluate(String function, String... args) {
        if (!enabled) return Map.of("verified", false, "message", "Fabric ledger is not enabled.");
        ManagedChannel channel = null;
        try {
            channel = newGrpcConnection();
            try (Gateway gateway = newGateway(channel)) {
            Contract contract = gateway.getNetwork(channelName).getContract(chaincodeName);
            return decode(contract.evaluateTransaction(function, args));
            }
        } catch (Exception error) {
            return Map.of("verified", false, "message", "Fabric verification failed: " + error.getMessage());
        } finally {
            if (channel != null) channel.shutdownNow();
        }
    }

    private Gateway newGateway(ManagedChannel channel) throws Exception {
        return Gateway.newInstance()
                .identity(newIdentity())
                .signer(newSigner())
                .hash(Hash.SHA256)
                .connection(channel)
                .evaluateOptions(options -> options.withDeadlineAfter(5, TimeUnit.SECONDS))
                .endorseOptions(options -> options.withDeadlineAfter(15, TimeUnit.SECONDS))
                .submitOptions(options -> options.withDeadlineAfter(10, TimeUnit.SECONDS))
                .commitStatusOptions(options -> options.withDeadlineAfter(1, TimeUnit.MINUTES))
                .connect();
    }

    private ManagedChannel newGrpcConnection() throws IOException {
        Path tlsCert = org1Path().resolve("peers/peer0.org1.example.com/tls/ca.crt");
        return Grpc.newChannelBuilder(peerEndpoint, TlsChannelCredentials.newBuilder().trustManager(tlsCert.toFile()).build())
                .overrideAuthority(peerHostname).build();
    }

    private Identity newIdentity() throws Exception {
        try (Reader reader = Files.newBufferedReader(firstFile(org1Path().resolve("users/User1@org1.example.com/msp/signcerts")))) {
            return new X509Identity(mspId, Identities.readX509Certificate(reader));
        }
    }

    private Signer newSigner() throws Exception {
        try (Reader reader = Files.newBufferedReader(firstFile(org1Path().resolve("users/User1@org1.example.com/msp/keystore")))) {
            return Signers.newPrivateKeySigner(Identities.readPrivateKey(reader));
        }
    }

    private Path org1Path() { return Path.of(networkPath).resolve("organizations/peerOrganizations/org1.example.com"); }
    private Path firstFile(Path directory) throws IOException {
        try (var files = Files.list(directory)) { return files.findFirst().orElseThrow(() -> new IOException("No identity file in " + directory)); }
    }
    private Map<String, Object> decode(byte[] value) throws IOException {
        return mapper.readValue(new String(value, StandardCharsets.UTF_8), new TypeReference<>() {});
    }
}
