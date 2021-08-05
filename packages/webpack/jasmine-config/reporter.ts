import { SpecReporter } from 'jasmine-spec-reporter';

jasmine.getEnv().clearReporters();

// @ts-ignore https://github.com/bcaudan/jasmine-spec-reporter/issues/588
jasmine.getEnv().addReporter(new SpecReporter());
