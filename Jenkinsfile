pipeline {
    agent any

    environment {
        IMAGE_NAME     = 'product-api'
        CONTAINER_NAME = 'product-api'
        HOST_PORT      = '8080'
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Build Docker Image') {
            steps {
                bat "docker build -t %IMAGE_NAME%:%BUILD_NUMBER% -t %IMAGE_NAME%:latest ."
            }
        }

        stage('Run Container') {
            steps {
                bat "docker rm -f %CONTAINER_NAME% || exit /b 0"
                bat "docker run -d --name %CONTAINER_NAME% -p %HOST_PORT%:3000 -e APP_NAME=product-api -e NODE_ENV=production %IMAGE_NAME%:latest"
            }
        }

        stage('Health Check') {
            steps {
                bat "ping -n 8 127.0.0.1 >nul"
                bat "curl -f http://localhost:%HOST_PORT%/health"
            }
        }
    }

    post {
        failure { bat "docker logs %CONTAINER_NAME% || exit /b 0" }
    }
}