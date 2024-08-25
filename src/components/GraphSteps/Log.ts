import chalk from 'chalk';
chalk.level = 3;

const error = (message?: any, ...optionalParams: any[]) => {
  console.log(chalk.red('[ERROR]', message, ...optionalParams));
};

const warning = (message?: any, ...optionalParams: any[]) => {
  console.log(chalk.magenta('[WARNING]', message, ...optionalParams));
};

const stepInGreen = (stepInGreen?: any, ...optionalParams: any[]) => {
  console.log(chalk.green(`[${stepInGreen}]`));
  console.log(
    ...optionalParams?.map((param) => {
      if (param && typeof param == 'string') {
        return chalk.gray(param);
      }
      return param;
    }),
  );
};

const bigStep = (bigStep?: any, ...optionalParams: any[]) => {
  console.log(chalk.yellow(`===== [BIG STEP]:${bigStep} =====`));
};

const info = (message?: any, ...optionalParams: any[]) => {
  console.info(chalk.grey(message), ...optionalParams);
};
const Log = { error, warning, stepInGreen, bigStep, info };
export { Log };
