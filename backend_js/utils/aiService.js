const { spawn } = require('child_process');
const path = require('path');
const logger = require('./logger');

class AIService {
  constructor() {
    this.pythonPath = 'python3';
    this.scriptsPath = path.join(__dirname, '../ai_scripts');
  }

  async generateRoadmap(userProfile, careerGoal, timeframe) {
    try {
      logger.info('Generating AI roadmap for user:', { careerGoal, timeframe });
      
      const scriptPath = path.join(this.scriptsPath, 'roadmap_generator.py');
      const inputData = JSON.stringify({
        userProfile,
        careerGoal,
        timeframe
      });

      return new Promise((resolve, reject) => {
        const pythonProcess = spawn(this.pythonPath, [scriptPath]);
        
        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
          result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          error += data.toString();
        });

        pythonProcess.stdin.write(inputData);
        pythonProcess.stdin.end();

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            logger.error('Python script error:', error);
            reject(new Error(`AI service error: ${error}`));
          } else {
            try {
              const roadmap = JSON.parse(result);
              logger.info('AI roadmap generated successfully');
              resolve(roadmap);
            } catch (parseError) {
              logger.error('Failed to parse AI response:', parseError);
              reject(new Error('Invalid AI response format'));
            }
          }
        });
      });
    } catch (error) {
      logger.error('AI service error:', error);
      throw error;
    }
  }

  async generateRecommendations(userSkills, learningHistory, marketTrends) {
    try {
      logger.info('Generating AI recommendations');
      
      const scriptPath = path.join(this.scriptsPath, 'recommendation_engine.py');
      const inputData = JSON.stringify({
        userSkills,
        learningHistory,
        marketTrends
      });

      return new Promise((resolve, reject) => {
        const pythonProcess = spawn(this.pythonPath, [scriptPath]);
        
        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
          result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          error += data.toString();
        });

        pythonProcess.stdin.write(inputData);
        pythonProcess.stdin.end();

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            logger.error('Python script error:', error);
            reject(new Error(`AI service error: ${error}`));
          } else {
            try {
              const recommendations = JSON.parse(result);
              logger.info('AI recommendations generated successfully');
              resolve(recommendations);
            } catch (parseError) {
              logger.error('Failed to parse AI response:', parseError);
              reject(new Error('Invalid AI response format'));
            }
          }
        });
      });
    } catch (error) {
      logger.error('AI service error:', error);
      throw error;
    }
  }

  async analyzeSkillAssessment(answers, questions) {
    try {
      logger.info('Analyzing skill assessment with AI');
      
      const scriptPath = path.join(this.scriptsPath, 'assessment_analyzer.py');
      const inputData = JSON.stringify({
        answers,
        questions
      });

      return new Promise((resolve, reject) => {
        const pythonProcess = spawn(this.pythonPath, [scriptPath]);
        
        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
          result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          error += data.toString();
        });

        pythonProcess.stdin.write(inputData);
        pythonProcess.stdin.end();

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            logger.error('Python script error:', error);
            reject(new Error(`AI service error: ${error}`));
          } else {
            try {
              const analysis = JSON.parse(result);
              logger.info('Assessment analysis completed');
              resolve(analysis);
            } catch (parseError) {
              logger.error('Failed to parse AI response:', parseError);
              reject(new Error('Invalid AI response format'));
            }
          }
        });
      });
    } catch (error) {
      logger.error('AI service error:', error);
      throw error;
    }
  }
}

module.exports = new AIService();