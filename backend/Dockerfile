FROM eclipse-temurin:17-jdk-jammy

WORKDIR /app

# copy only backend
COPY backend ./backend

WORKDIR /app/backend

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

# We use target/*.jar to automatically pick up the correct jar name
CMD ["sh", "-c", "java -jar target/*.jar"]
