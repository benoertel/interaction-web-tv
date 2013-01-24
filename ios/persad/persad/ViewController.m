//
//  ViewController.m
//  persad
//
//  Created by Benjamin Oertel on 16.01.13.
//  Copyright (c) 2013 Benjamin Oertel. All rights reserved.
//

#import "ViewController.h"

@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    NSString *fullURL = @"http://ec2-107-22-145-140.compute-1.amazonaws.com/app";
    NSURL *url = [NSURL URLWithString:fullURL];
    NSURLRequest *requestObj = [NSURLRequest requestWithURL:url];
    [_viewWeb loadRequest:requestObj];
	// Do any additional setup after loading the view, typically from a nib.
    [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
