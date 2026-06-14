FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY . .

RUN mkdir -p out && javac -encoding UTF-8 -cp "lib/*" -d out src/*.java

EXPOSE 8080

CMD ["java", "-cp", "out:lib/*", "-Djava.library.path=lib", "pancitallena"]