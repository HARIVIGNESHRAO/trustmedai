FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -DskipTests

COPY src src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S trustmed && adduser -S trustmed -G trustmed
COPY --from=build /workspace/target/*.jar app.jar
USER trustmed
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
