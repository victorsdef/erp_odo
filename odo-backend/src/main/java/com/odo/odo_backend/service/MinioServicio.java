package com.odo.odo_backend.service;

import io.minio.*;
import io.minio.errors.MinioException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Service
@Slf4j
public class MinioServicio {

    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Value("${minio.bucket}")
    private String bucket;

    private MinioClient client;

    @PostConstruct
    public void init() {
        client = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
        try {
            boolean exists = client.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                client.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                String policy = """
                        {"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::%s/*"]}]}
                        """.formatted(bucket);
                client.setBucketPolicy(SetBucketPolicyArgs.builder().bucket(bucket).config(policy).build());
                log.info("Bucket '{}' creado con acceso publico de lectura", bucket);
            }
        } catch (Exception e) {
            log.warn("No se pudo inicializar MinIO: {}. La subida de fotos no estara disponible.", e.getMessage());
        }
    }

    public String subirFoto(MultipartFile archivo) throws Exception {
        String extension = obtenerExtension(archivo.getOriginalFilename());
        String nombre    = "perfil/" + UUID.randomUUID() + extension;

        client.putObject(
                PutObjectArgs.builder()
                        .bucket(bucket)
                        .object(nombre)
                        .stream(archivo.getInputStream(), archivo.getSize(), -1)
                        .contentType(archivo.getContentType())
                        .build()
        );
        return nombre;
    }

    public InputStream obtenerFoto(String nombre) throws Exception {
        return client.getObject(
                GetObjectArgs.builder()
                        .bucket(bucket)
                        .object(nombre)
                        .build()
        );
    }

    private String obtenerExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf('.'));
    }
}
