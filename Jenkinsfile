pipeline {
    agent any
    
    environment {
        APP_NAME = 'chat-room-test'    // 测试环境使用不同的名称
        PORT = '3001'                  // 测试环境端口
        DOCKER_IMAGE = 'chat-room-test' // 添加这个变量定义
    }
    
    stages {
        stage('检出代码') {
            steps {
                echo '开始拉取代码...'
                checkout scm
            }
        }
        
        stage('构建Docker镜像') {
            steps {
                echo '开始构建Docker镜像...'
                script {
                    try {
                        sh """
                            docker build -t ${env.DOCKER_IMAGE}:${BUILD_NUMBER} .
                            docker tag ${env.DOCKER_IMAGE}:${BUILD_NUMBER} ${env.DOCKER_IMAGE}:latest
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
                            docker stop ${env.DOCKER_IMAGE} || true
                            docker rm ${env.DOCKER_IMAGE} || true
                            docker run -d --name ${env.DOCKER_IMAGE} \
                                -p ${PORT}:${PORT} \
                                ${env.DOCKER_IMAGE}:latest
                        """
                    } catch (Exception e) {
                        error "部署失败: ${e.message}"
                    }
                }
            }
        }
    }
    
    post {
        success {
            echo '部署成功!'
        }
        failure {
            echo '部署失败!'
        }
        always {
            script {
                try {
                    sh """
                        docker image prune -f
                        docker images ${env.DOCKER_IMAGE} -q | sort -r | tail -n +3 | xargs docker rmi -f || true
                    """
                } catch (Exception e) {
                    echo "清理过程出现错误: ${e.message}"
                }
            }
        }
    }
}