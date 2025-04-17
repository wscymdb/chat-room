pipeline {
    agent any
    
    environment {
        APP_NAME = 'chat-room-test'    // 测试环境使用不同的名称
        PORT = '3000'                  // 测试环境端口
        DOCKER_IMAGE = 'chat-room-test' // 添加这个变量定义
    }
    
    stages {
        stage('检出代码') {
            steps {
                echo '开始拉取代码...'
                checkout scm
                // 强制拉取最新代码
                sh 'git fetch --all'
                sh 'git reset --hard origin/main'  // 或者替换为您的目标分支
                // 检查文件是否存在
                sh 'ls -la'
                sh 'test -f build.sh && echo "build.sh 文件存在" || echo "build.sh 文件不存在"'
                // 确保 build.sh 有执行权限
                sh 'test -f build.sh && chmod +x build.sh || echo "无法设置执行权限，因为文件不存在"'
            }
        }
        
        stage('准备构建环境') {
            steps {
                echo '准备构建环境...'
                // // 显示当前的文件列表和工作目录
                // sh 'pwd && ls -la'
                // // 检查 build.sh 文件内容
                // sh 'test -f build.sh && cat build.sh || echo "无法显示内容，因为文件不存在"'
            }
        }
        
        stage('构建Docker镜像') {
            steps {
                echo '开始构建Docker镜像...'
                script {
                    try {
                        sh """
                            # 使用 --no-cache 参数强制重新构建，传入当前时间作为 CACHEBUST 参数
                            docker build --no-cache --build-arg CACHEBUST=\$(date +%s) -t ${env.DOCKER_IMAGE}:${BUILD_NUMBER} .
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