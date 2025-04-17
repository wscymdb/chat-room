pipeline {
    agent any
    
    environment {
        APP_NAME = 'chat-room'  // 使用实际的项目名称
        DOCKER_IMAGE = "${APP_NAME}"
        PORT = '3000'
    }
    
    stages {
        stage('检出代码') {
            steps {
                echo '开始拉取代码...'
                checkout scm
            }
        }
        
        stage('构建准备') {
            steps {
                echo '清理旧的构建文件...'
                sh 'npm cache clean --force || true'
            }
        }
        
        stage('构建Docker镜像') {
            steps {
                echo '开始构建Docker镜像...'
                script {
                    try {
                        sh """
                            docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} .
                            docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest
                        """
                    } catch (Exception e) {
                        error "Docker构建失败: ${e.message}"
                    }
                }
            }
        }
        
        stage('部署应用') {
            steps {
                echo '开始部署应用...'
                script {
                    try {
                        sh """
                            docker stop ${APP_NAME} || true
                            docker rm ${APP_NAME} || true
                            docker run -d --name ${APP_NAME} \
                                -p ${PORT}:${PORT} \
                                --restart unless-stopped \
                                ${DOCKER_IMAGE}:latest
                        """
                    } catch (Exception e) {
                        error "部署失败: ${e.message}"
                    }
                }
            }
        }
        
        stage('健康检查') {
            steps {
                echo '执行健康检查...'
                script {
                    sh """
                        # 等待应用启动
                        sleep 10
                        # 检查应用是否响应
                        curl -f http://localhost:${PORT} || exit 1
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo '部署成功!'
            // 可以添加成功通知
        }
        failure {
            echo '部署失败!'
            // 可以添加失败通知
        }
        always {
            // 清理旧的Docker镜像
            sh """
                docker image prune -f
                docker images ${DOCKER_IMAGE} -q | sort -r | tail -n +3 | xargs docker rmi -f || true
            """
        }
    }
}